const db = require("../db/connection");

function findByUsername(username) {
  return db
    .prepare(
      "SELECT id, username, password_hash, role, created_at, last_login_at FROM admin_users WHERE username = ?"
    )
    .get(username);
}

function findById(id) {
  return db
    .prepare("SELECT id, username, role, created_at, last_login_at FROM admin_users WHERE id = ?")
    .get(id);
}

function updateLastLogin(id) {
  db.prepare("UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
}

module.exports = {
  findByUsername,
  findById,
  updateLastLogin
};
