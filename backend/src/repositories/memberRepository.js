const db = require("../db/connection");

function createMember(memberData) {
  const result = db
    .prepare(
      `
      INSERT INTO members(member_number, name, phone, gender, age_bracket, location, subcounty, family_id)
      VALUES (@member_number, @name, @phone, @gender, @age_bracket, @location, @subcounty, @family_id)
    `
    )
    .run(memberData);

  return db.prepare("SELECT * FROM members WHERE id = ?").get(result.lastInsertRowid);
}

function findByPhone(phone) {
  if (!phone) return null;
  return db.prepare("SELECT * FROM members WHERE phone = ?").get(phone);
}

function findPotentialNameMatches(name, limit = 10) {
  const terms = String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (terms.length === 0) return [];

  const q = `%${terms[0]}%`;
  return db
    .prepare(
      `
      SELECT * FROM members
      WHERE name LIKE ?
      ORDER BY created_at DESC
      LIMIT ?
    `
    )
    .all(q, limit);
}

function listMembers(filters) {
  const where = [];
  const params = {};

  if (filters.search) {
    where.push("(m.name LIKE @search OR m.phone LIKE @search OR m.member_number LIKE @search)");
    params.search = `%${filters.search}%`;
  }

  if (filters.location) {
    where.push("m.location = @location");
    params.location = filters.location;
  }

  if (filters.ageBracket) {
    where.push("m.age_bracket = @ageBracket");
    params.ageBracket = filters.ageBracket;
  }

  if (filters.familyId) {
    where.push("m.family_id = @familyId");
    params.familyId = Number(filters.familyId);
  }

  const page = Math.max(Number(filters.page || 1), 1);
  const limit = Math.min(Math.max(Number(filters.limit || 20), 1), 100);
  const offset = (page - 1) * limit;

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const rows = db
    .prepare(
      `
      SELECT
        m.*,
        f.family_name
      FROM members m
      LEFT JOIN families f ON f.id = m.family_id
      ${whereSql}
      ORDER BY m.created_at DESC
      LIMIT @limit OFFSET @offset
    `
    )
    .all({ ...params, limit, offset });

  const total = db
    .prepare(`SELECT COUNT(1) AS total FROM members m ${whereSql}`)
    .get(params).total;

  return {
    rows,
    pagination: { page, limit, total }
  };
}

function membersByFamily(familyId) {
  return db
    .prepare(
      `
      SELECT m.*, f.family_name
      FROM members m
      LEFT JOIN families f ON f.id = m.family_id
      WHERE m.family_id = ?
      ORDER BY m.created_at ASC
    `
    )
    .all(familyId);
}

function analyticsSummary() {
  const totalMembers = db.prepare("SELECT COUNT(1) AS total FROM members").get().total;
  const totalFamilies = db.prepare("SELECT COUNT(1) AS total FROM families").get().total;
  const pendingSubmissions = db
    .prepare("SELECT COUNT(1) AS total FROM staging_members WHERE status = 'pending'")
    .get().total;

  return { totalMembers, totalFamilies, pendingSubmissions };
}

function analyticsByLocation() {
  return db
    .prepare(
      `
      SELECT location, COUNT(1) AS total
      FROM members
      GROUP BY location
      ORDER BY total DESC, location ASC
    `
    )
    .all();
}

function analyticsByAgeBracket() {
  return db
    .prepare(
      `
      SELECT age_bracket, COUNT(1) AS total
      FROM members
      GROUP BY age_bracket
      ORDER BY total DESC
    `
    )
    .all();
}

module.exports = {
  createMember,
  findByPhone,
  findPotentialNameMatches,
  listMembers,
  membersByFamily,
  analyticsSummary,
  analyticsByLocation,
  analyticsByAgeBracket
};
