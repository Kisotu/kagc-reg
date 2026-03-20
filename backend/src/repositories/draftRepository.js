const db = require("../db/connection");

function getDraft(sessionId) {
  return db.prepare("SELECT session_id, payload, step, updated_at FROM form_drafts WHERE session_id = ?").get(sessionId);
}

function upsertDraft(sessionId, payload, step) {
  db.prepare(
    `
      INSERT INTO form_drafts(session_id, payload, step, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(session_id)
      DO UPDATE SET payload = excluded.payload, step = excluded.step, updated_at = CURRENT_TIMESTAMP
    `
  ).run(sessionId, JSON.stringify(payload), step || null);

  return getDraft(sessionId);
}

function deleteDraft(sessionId) {
  return db.prepare("DELETE FROM form_drafts WHERE session_id = ?").run(sessionId);
}

module.exports = {
  getDraft,
  upsertDraft,
  deleteDraft
};
