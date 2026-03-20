const asyncHandler = require("../utils/asyncHandler");
const memberRepository = require("../repositories/memberRepository");
const { rowsToCsv } = require("../utils/csv");

const listMembers = asyncHandler(async (req, res) => {
  const result = memberRepository.listMembers(req.query);
  res.json({ data: result.rows, pagination: result.pagination });
});

const listFamilyMembers = asyncHandler(async (req, res) => {
  const rows = memberRepository.membersByFamily(Number(req.params.familyId));
  res.json({ data: rows });
});

const exportMembersCsv = asyncHandler(async (req, res) => {
  const result = memberRepository.listMembers({ ...req.query, page: 1, limit: 100000 });

  const csv = rowsToCsv(
    [
      { key: "member_number", label: "Member Number" },
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "gender", label: "Gender" },
      { key: "age_bracket", label: "Age Bracket" },
      { key: "location", label: "Location" },
      { key: "subcounty", label: "Subcounty" },
      { key: "family_name", label: "Family" },
      { key: "created_at", label: "Created At" }
    ],
    result.rows
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=members.csv");
  res.send(csv);
});

module.exports = {
  listMembers,
  listFamilyMembers,
  exportMembersCsv
};
