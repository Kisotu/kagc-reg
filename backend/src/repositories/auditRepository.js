const db = require("../db/connection");

function insertAuditLog(adminUserId, action, entityType, entityId, metadata = null) {
  db.prepare(
    `
      INSERT INTO audit_logs(admin_user_id, action, entity_type, entity_id, metadata)
      VALUES (?, ?, ?, ?, ?)
    `
  ).run(adminUserId || null, action, entityType, entityId || null, metadata ? JSON.stringify(metadata) : null);
}

module.exports = {
  insertAuditLog
};
