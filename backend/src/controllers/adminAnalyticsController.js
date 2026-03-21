const asyncHandler = require("../utils/asyncHandler");
const memberRepository = require("../repositories/memberRepository");

const summary = asyncHandler(async (req, res) => {
  res.json({ data: memberRepository.analyticsSummary() });
});

const byLocation = asyncHandler(async (req, res) => {
  res.json({ data: memberRepository.analyticsByLocation() });
});

const byCounty = asyncHandler(async (req, res) => {
  res.json({ data: memberRepository.analyticsByCounty() });
});

const byAgeBracket = asyncHandler(async (req, res) => {
  res.json({ data: memberRepository.analyticsByAgeBracket() });
});

module.exports = {
  summary,
  byLocation,
  byCounty,
  byAgeBracket
};
