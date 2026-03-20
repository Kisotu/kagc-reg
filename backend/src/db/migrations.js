const db = require("./connection");

function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'data_cleaner')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_name TEXT NOT NULL,
      location TEXT,
      subcounty TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_number TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      phone TEXT,
      gender TEXT NOT NULL,
      age_bracket TEXT NOT NULL,
      location TEXT,
      subcounty TEXT,
      family_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS staging_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registration_type TEXT NOT NULL CHECK(registration_type IN ('individual', 'family')),
      family_name TEXT,
      location TEXT,
      subcounty TEXT,
      source_session_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'merged')),
      duplicate_flag INTEGER NOT NULL DEFAULT 0,
      submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TEXT,
      reviewed_by INTEGER,
      FOREIGN KEY(reviewed_by) REFERENCES admin_users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS staging_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      gender TEXT NOT NULL,
      age_bracket TEXT NOT NULL,
      location TEXT,
      subcounty TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'merged')),
      duplicate_flag INTEGER NOT NULL DEFAULT 0,
      duplicate_score REAL,
      duplicate_note TEXT,
      rejection_reason TEXT,
      merged_into_member_id INTEGER,
      submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TEXT,
      reviewed_by INTEGER,
      FOREIGN KEY(batch_id) REFERENCES staging_batches(id) ON DELETE CASCADE,
      FOREIGN KEY(reviewed_by) REFERENCES admin_users(id) ON DELETE SET NULL,
      FOREIGN KEY(merged_into_member_id) REFERENCES members(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS form_drafts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL UNIQUE,
      payload TEXT NOT NULL,
      step TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS member_sequence (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      last_number INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT NOT NULL,
      subcounty TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
    CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
    CREATE INDEX IF NOT EXISTS idx_members_location ON members(location);

    CREATE INDEX IF NOT EXISTS idx_staging_members_phone ON staging_members(phone);
    CREATE INDEX IF NOT EXISTS idx_staging_members_name ON staging_members(name);
    CREATE INDEX IF NOT EXISTS idx_staging_members_status ON staging_members(status);

    CREATE INDEX IF NOT EXISTS idx_staging_batches_status ON staging_batches(status);
    CREATE INDEX IF NOT EXISTS idx_staging_batches_submitted_at ON staging_batches(submitted_at);

    CREATE INDEX IF NOT EXISTS idx_locations_location ON locations(location);
    CREATE INDEX IF NOT EXISTS idx_locations_subcounty ON locations(subcounty);

    INSERT OR IGNORE INTO member_sequence(id, last_number) VALUES (1, 0);
  `);
}

module.exports = {
  runMigrations
};
