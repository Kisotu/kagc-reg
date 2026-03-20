const db = require("../db/connection");

function searchLocations(query, limit = 20) {
  const wildcard = `%${query.toLowerCase()}%`;

  return db
    .prepare(
      `
      SELECT
        COALESCE(ward, location) AS location,
        COALESCE(constituency, subcounty) AS subcounty,
        county,
        constituency,
        COALESCE(ward, location) AS ward,
        TRIM(
          COALESCE(county || ' -> ', '') ||
          COALESCE(COALESCE(constituency, subcounty) || ' -> ', '') ||
          COALESCE(ward, location)
        ) AS label
      FROM locations
      WHERE
        lower(COALESCE(county, '')) LIKE ?
        OR lower(COALESCE(constituency, subcounty, '')) LIKE ?
        OR lower(COALESCE(ward, location, '')) LIKE ?
        OR lower(COALESCE(location, '')) LIKE ?
        OR lower(COALESCE(subcounty, '')) LIKE ?
      ORDER BY county ASC, constituency ASC, ward ASC, location ASC, subcounty ASC
      LIMIT ?
    `
    )
    .all(wildcard, wildcard, wildcard, wildcard, wildcard, limit);
}

module.exports = {
  searchLocations
};
