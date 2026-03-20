const auditRepository = require("../repositories/auditRepository");

function logAdminAction({ adminUserId, action, entityType, entityId, metadata }) {
  auditRepository.insertAuditLog(adminUserId, action, entityType, entityId, metadata);
}

module.exports = {
  logAdminAction
};
