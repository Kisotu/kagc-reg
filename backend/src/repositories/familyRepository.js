const db = require("../db/connection");

function createFamily(familyName, location, subcounty) {
  const result = db
    .prepare(
      "INSERT INTO families(family_name, location, subcounty) VALUES (?, ?, ?)"
    )
    .run(familyName, location || null, subcounty || null);

  return db.prepare("SELECT * FROM families WHERE id = ?").get(result.lastInsertRowid);
}

function getFamilyById(id) {
  return db.prepare("SELECT * FROM families WHERE id = ?").get(id);
}

module.exports = {
  createFamily,
  getFamilyById
};
