const asyncHandler = require("../utils/asyncHandler");
const locationRepository = require("../repositories/locationRepository");

const searchLocations = asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 3) {
    return res.status(400).json({ message: "Query must be at least 3 characters" });
  }

  const rows = locationRepository.searchLocations(q, Math.min(Number(req.query.limit || 20), 50));
  return res.json({ data: rows });
});

module.exports = {
  searchLocations
};
