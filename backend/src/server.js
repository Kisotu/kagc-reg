const app = require("./app");
const env = require("./config/env");
const { runMigrations } = require("./db/migrations");
const { seedLocations } = require("./db/seedLocations");
const db = require("./db/connection");

runMigrations();
seedLocations();

const hasAdmin = db.prepare("SELECT COUNT(1) AS total FROM admin_users").get().total;
if (!hasAdmin) {
  console.log("No admin user found. Run: npm run db:seed-admin");
}

app.listen(env.port, () => {
  console.log(`KAGC backend running on port ${env.port}`);
});
