const db = require("../db/connection");

function createBatch(payload) {
  const result = db
    .prepare(
      `
      INSERT INTO staging_batches(registration_type, family_name, location, subcounty, source_session_id)
      VALUES (@registration_type, @family_name, @location, @subcounty, @source_session_id)
    `
    )
    .run(payload);

  return getBatchById(result.lastInsertRowid);
}

function createStagingMember(payload) {
  const result = db
    .prepare(
      `
      INSERT INTO staging_members(batch_id, name, phone, gender, age_bracket, location, subcounty, duplicate_flag, duplicate_score, duplicate_note)
      VALUES (@batch_id, @name, @phone, @gender, @age_bracket, @location, @subcounty, @duplicate_flag, @duplicate_score, @duplicate_note)
    `
    )
    .run(payload);

  return getStagingMemberById(result.lastInsertRowid);
}

function getBatchById(batchId) {
  return db.prepare("SELECT * FROM staging_batches WHERE id = ?").get(batchId);
}

function getBatchMembers(batchId) {
  return db
    .prepare(
      "SELECT * FROM staging_members WHERE batch_id = ? ORDER BY id ASC"
    )
    .all(batchId);
}

function getBatchWithMembers(batchId) {
  const batch = getBatchById(batchId);
  if (!batch) return null;
  return {
    ...batch,
    members: getBatchMembers(batchId)
  };
}

function listBatches(filters) {
  const where = [];
  const params = {};

  if (filters.status) {
    where.push("b.status = @status");
    params.status = filters.status;
  }
  if (filters.location) {
    where.push("b.location = @location");
    params.location = filters.location;
  }
  if (filters.dateFrom) {
    where.push("date(b.submitted_at) >= date(@dateFrom)");
    params.dateFrom = filters.dateFrom;
  }
  if (filters.dateTo) {
    where.push("date(b.submitted_at) <= date(@dateTo)");
    params.dateTo = filters.dateTo;
  }

  const page = Math.max(Number(filters.page || 1), 1);
  const limit = Math.min(Math.max(Number(filters.limit || 20), 1), 100);
  const offset = (page - 1) * limit;

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const rows = db
    .prepare(
      `
      SELECT
        b.*,
        COUNT(sm.id) AS total_members,
        SUM(CASE WHEN sm.status = 'pending' THEN 1 ELSE 0 END) AS pending_members,
        SUM(CASE WHEN sm.duplicate_flag = 1 THEN 1 ELSE 0 END) AS duplicate_members
      FROM staging_batches b
      LEFT JOIN staging_members sm ON sm.batch_id = b.id
      ${whereSql}
      GROUP BY b.id
      ORDER BY b.submitted_at DESC
      LIMIT @limit OFFSET @offset
    `
    )
    .all({ ...params, limit, offset });

  const total = db
    .prepare(`SELECT COUNT(1) AS total FROM staging_batches b ${whereSql}`)
    .get(params).total;

  return {
    rows,
    pagination: { page, limit, total }
  };
}

function getStagingMemberById(memberId) {
  return db
    .prepare(
      `
      SELECT sm.*, b.registration_type, b.family_name, b.location AS batch_location, b.subcounty AS batch_subcounty
      FROM staging_members sm
      INNER JOIN staging_batches b ON b.id = sm.batch_id
      WHERE sm.id = ?
    `
    )
    .get(memberId);
}

function updateStagingMemberStatus(memberId, patch) {
  const safePatch = {
    status: null,
    rejection_reason: null,
    merged_into_member_id: null,
    reviewed_by: null,
    ...patch
  };

  db.prepare(
    `
      UPDATE staging_members
      SET
        status = COALESCE(@status, status),
        rejection_reason = COALESCE(@rejection_reason, rejection_reason),
        merged_into_member_id = COALESCE(@merged_into_member_id, merged_into_member_id),
        reviewed_by = COALESCE(@reviewed_by, reviewed_by),
        reviewed_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `
  ).run({ id: memberId, ...safePatch });

  return getStagingMemberById(memberId);
}

function markBatchStatusFromMembers(batchId, reviewedBy = null) {
  const stats = db
    .prepare(
      `
      SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
        SUM(CASE WHEN status = 'merged' THEN 1 ELSE 0 END) AS merged_count
      FROM staging_members
      WHERE batch_id = ?
    `
    )
    .get(batchId);

  let batchStatus = "pending";
  if (stats.pending_count === 0) {
    if (stats.approved_count > 0 && stats.rejected_count === 0 && stats.merged_count === 0) {
      batchStatus = "approved";
    } else if (stats.rejected_count > 0 && stats.approved_count === 0 && stats.merged_count === 0) {
      batchStatus = "rejected";
    } else {
      batchStatus = "merged";
    }
  }

  db.prepare(
    `
      UPDATE staging_batches
      SET status = ?, reviewed_by = COALESCE(?, reviewed_by), reviewed_at = CASE WHEN ? = 'pending' THEN reviewed_at ELSE CURRENT_TIMESTAMP END
      WHERE id = ?
    `
  ).run(batchStatus, reviewedBy, batchStatus, batchId);

  return getBatchById(batchId);
}

function setBatchDuplicateFlag(batchId) {
  const hasDuplicates = db
    .prepare(
      "SELECT COUNT(1) AS total FROM staging_members WHERE batch_id = ? AND duplicate_flag = 1"
    )
    .get(batchId).total;

  db.prepare("UPDATE staging_batches SET duplicate_flag = ? WHERE id = ?").run(hasDuplicates > 0 ? 1 : 0, batchId);
}

function listDuplicateCandidatesForMember(stagingMemberId) {
  const member = getStagingMemberById(stagingMemberId);
  if (!member) return [];

  return db
    .prepare(
      `
      SELECT id, member_number, name, phone, gender, age_bracket, location, subcounty, created_at
      FROM members
      WHERE (phone IS NOT NULL AND phone = @phone) OR name LIKE @nameLike
      ORDER BY created_at DESC
      LIMIT 25
    `
    )
    .all({ phone: member.phone || "", nameLike: `%${member.name.split(" ")[0]}%` });
}

module.exports = {
  createBatch,
  createStagingMember,
  getBatchById,
  getBatchMembers,
  getBatchWithMembers,
  listBatches,
  getStagingMemberById,
  updateStagingMemberStatus,
  markBatchStatusFromMembers,
  setBatchDuplicateFlag,
  listDuplicateCandidatesForMember
};
