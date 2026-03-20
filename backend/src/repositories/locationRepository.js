const db = require("../db/connection");

function searchLocations(query, limit = 20) {
  return db
    .prepare(
      `
      SELECT location, subcounty
      FROM locations
      WHERE lower(location) LIKE ? OR lower(subcounty) LIKE ?
      ORDER BY location ASC, subcounty ASC
      LIMIT ?
    `
    )
    .all(`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`, limit);
}

module.exports = {
  searchLocations
};
