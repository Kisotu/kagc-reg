const memberRepository = require("../repositories/memberRepository");
const { similarityScore } = require("../utils/fuzzy");

function checkDuplicateForMember(candidate) {
  const phoneMatch = candidate.phone ? memberRepository.findByPhone(candidate.phone) : null;
  if (phoneMatch) {
    return {
      duplicateFlag: 1,
      duplicateScore: 1,
      duplicateNote: `Phone matches existing member ${phoneMatch.member_number}`
    };
  }

  const potential = memberRepository.findPotentialNameMatches(candidate.name, 10);
  let best = null;

  for (const row of potential) {
    const score = similarityScore(candidate.name, row.name);
    if (!best || score > best.score) {
      best = { score, row };
    }
  }

  if (best && best.score >= 0.82) {
    return {
      duplicateFlag: 1,
      duplicateScore: Number(best.score.toFixed(3)),
      duplicateNote: `Name similar to ${best.row.member_number} (${best.row.name})`
    };
  }

  return {
    duplicateFlag: 0,
    duplicateScore: null,
    duplicateNote: null
  };
}

module.exports = {
  checkDuplicateForMember
};
