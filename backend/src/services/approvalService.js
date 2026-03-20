const db = require("../db/connection");
const stagingRepository = require("../repositories/stagingRepository");
const familyRepository = require("../repositories/familyRepository");
const memberRepository = require("../repositories/memberRepository");
const { toMemberNumber } = require("../utils/memberNumber");
const { ApiError } = require("../utils/errors");

function nextMemberNumber() {
  const seq = db.prepare("SELECT last_number FROM member_sequence WHERE id = 1").get();
  const next = seq.last_number + 1;
  db.prepare("UPDATE member_sequence SET last_number = ? WHERE id = 1").run(next);
  return toMemberNumber(next);
}

function approveStagingMember(stagingMemberId, reviewerId) {
  const tx = db.transaction(() => {
    const stagingMember = stagingRepository.getStagingMemberById(stagingMemberId);
    if (!stagingMember) {
      throw new ApiError(404, "Staging member not found");
    }
    if (stagingMember.status !== "pending") {
      throw new ApiError(409, `Cannot approve member in ${stagingMember.status} state`);
    }

    let familyId = null;
    if (stagingMember.registration_type === "family" && stagingMember.family_name) {
      const batch = stagingRepository.getBatchById(stagingMember.batch_id);
      const existingFamily = db
        .prepare(
          "SELECT id FROM families WHERE family_name = ? AND COALESCE(location, '') = COALESCE(?, '') AND COALESCE(subcounty, '') = COALESCE(?, '') ORDER BY id DESC LIMIT 1"
        )
        .get(batch.family_name, batch.location, batch.subcounty);

      if (existingFamily) {
        familyId = existingFamily.id;
      } else {
        const createdFamily = familyRepository.createFamily(batch.family_name, batch.location, batch.subcounty);
        familyId = createdFamily.id;
      }
    }

    const memberNumber = nextMemberNumber();
    const created = memberRepository.createMember({
      member_number: memberNumber,
      name: stagingMember.name,
      phone: stagingMember.phone,
      gender: stagingMember.gender,
      age_bracket: stagingMember.age_bracket,
      location: stagingMember.location || stagingMember.batch_location || null,
      subcounty: stagingMember.subcounty || stagingMember.batch_subcounty || null,
      family_id: familyId
    });

    const updated = stagingRepository.updateStagingMemberStatus(stagingMemberId, {
      status: "approved",
      reviewed_by: reviewerId
    });

    stagingRepository.markBatchStatusFromMembers(stagingMember.batch_id, reviewerId);

    return {
      stagingMember: updated,
      member: created
    };
  });

  return tx();
}

function rejectStagingMember(stagingMemberId, reviewerId, reason) {
  const tx = db.transaction(() => {
    const stagingMember = stagingRepository.getStagingMemberById(stagingMemberId);
    if (!stagingMember) {
      throw new ApiError(404, "Staging member not found");
    }
    if (stagingMember.status !== "pending") {
      throw new ApiError(409, `Cannot reject member in ${stagingMember.status} state`);
    }

    const updated = stagingRepository.updateStagingMemberStatus(stagingMemberId, {
      status: "rejected",
      rejection_reason: reason || "Not specified",
      reviewed_by: reviewerId
    });

    stagingRepository.markBatchStatusFromMembers(stagingMember.batch_id, reviewerId);
    return updated;
  });

  return tx();
}

function mergeStagingMember(stagingMemberId, reviewerId, targetMemberId) {
  const tx = db.transaction(() => {
    const stagingMember = stagingRepository.getStagingMemberById(stagingMemberId);
    if (!stagingMember) {
      throw new ApiError(404, "Staging member not found");
    }
    if (stagingMember.status !== "pending") {
      throw new ApiError(409, `Cannot merge member in ${stagingMember.status} state`);
    }

    const target = db.prepare("SELECT id FROM members WHERE id = ?").get(targetMemberId);
    if (!target) {
      throw new ApiError(404, "Target member not found");
    }

    const updated = stagingRepository.updateStagingMemberStatus(stagingMemberId, {
      status: "merged",
      merged_into_member_id: targetMemberId,
      reviewed_by: reviewerId
    });

    stagingRepository.markBatchStatusFromMembers(stagingMember.batch_id, reviewerId);
    return updated;
  });

  return tx();
}

module.exports = {
  approveStagingMember,
  rejectStagingMember,
  mergeStagingMember
};
