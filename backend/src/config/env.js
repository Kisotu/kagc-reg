const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const rootDir = path.resolve(__dirname, "../../");

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  dbPath: process.env.DB_PATH
    ? path.resolve(rootDir, process.env.DB_PATH)
    : path.resolve(rootDir, "data/kagc.sqlite"),
  sessionSecret: process.env.SESSION_SECRET || "dev-secret-change-me",
  adminDefaultUsername: process.env.ADMIN_DEFAULT_USERNAME || "admin",
  adminDefaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || "ChangeMe123!",
  trustProxy: String(process.env.TRUST_PROXY || "false") === "true"
};

module.exports = env;
