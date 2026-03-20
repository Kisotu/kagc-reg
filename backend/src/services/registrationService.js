const db = require("../db/connection");
const stagingRepository = require("../repositories/stagingRepository");
const duplicateService = require("./duplicateService");
const { BATCH_TYPE } = require("../config/constants");

function submitIndividualRegistration(payload) {
  const tx = db.transaction(() => {
    const batch = stagingRepository.createBatch({
      registration_type: BATCH_TYPE.INDIVIDUAL,
      family_name: null,
      location: payload.location,
      subcounty: payload.subcounty,
      source_session_id: payload.sessionId || null
    });

    const duplicate = duplicateService.checkDuplicateForMember(payload);

    const member = stagingRepository.createStagingMember({
      batch_id: batch.id,
      name: payload.name,
      phone: payload.phone || null,
      gender: payload.gender,
      age_bracket: payload.age_bracket,
      location: payload.location || null,
      subcounty: payload.subcounty || null,
      duplicate_flag: duplicate.duplicateFlag,
      duplicate_score: duplicate.duplicateScore,
      duplicate_note: duplicate.duplicateNote
    });

    stagingRepository.setBatchDuplicateFlag(batch.id);

    return {
      batch,
      members: [member]
    };
  });

  return tx();
}

function submitFamilyRegistration(payload) {
  const tx = db.transaction(() => {
    const batch = stagingRepository.createBatch({
      registration_type: BATCH_TYPE.FAMILY,
      family_name: payload.family_name,
      location: payload.location,
      subcounty: payload.subcounty,
      source_session_id: payload.sessionId || null
    });

    const members = payload.members.map((member) => {
      const merged = {
        ...member,
        location: member.location || payload.location || null,
        subcounty: member.subcounty || payload.subcounty || null
      };

      const duplicate = duplicateService.checkDuplicateForMember(merged);

      return stagingRepository.createStagingMember({
        batch_id: batch.id,
        name: merged.name,
        phone: merged.phone || null,
        gender: merged.gender,
        age_bracket: merged.age_bracket,
        location: merged.location,
        subcounty: merged.subcounty,
        duplicate_flag: duplicate.duplicateFlag,
        duplicate_score: duplicate.duplicateScore,
        duplicate_note: duplicate.duplicateNote
      });
    });

    stagingRepository.setBatchDuplicateFlag(batch.id);

    return { batch, members };
  });

  return tx();
}

module.exports = {
  submitIndividualRegistration,
  submitFamilyRegistration
};
