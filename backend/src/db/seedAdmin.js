const bcrypt = require("bcryptjs");
const env = require("../config/env");
const db = require("./connection");
const { runMigrations } = require("./migrations");

runMigrations();

const existing = db
  .prepare("SELECT id FROM admin_users WHERE username = ?")
  .get(env.adminDefaultUsername);

if (existing) {
  console.log("Admin user already exists.");
  process.exit(0);
}

const passwordHash = bcrypt.hashSync(env.adminDefaultPassword, 12);

db.prepare(
  "INSERT INTO admin_users(username, password_hash, role) VALUES (?, ?, 'admin')"
).run(env.adminDefaultUsername, passwordHash);

console.log("Admin user created successfully.");
console.log(`Username: ${env.adminDefaultUsername}`);
console.log("Password: (from ADMIN_DEFAULT_PASSWORD env var)");
