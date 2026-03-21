const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const rootDir = path.resolve(__dirname, "../../");

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
}

function parseAllowedOrigins(value) {
  if (!value) return [];

  return String(value)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function normalizeSameSite(value, fallback) {
  const raw = String(value || fallback).toLowerCase();
  if (["lax", "strict", "none"].includes(raw)) return raw;
  return fallback;
}

const isProduction = (process.env.NODE_ENV || "development") === "production";

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  dbPath: process.env.DB_PATH
    ? path.resolve(rootDir, process.env.DB_PATH)
    : path.resolve(rootDir, "data/kagc.sqlite"),
  sessionSecret: process.env.SESSION_SECRET || "dev-secret-change-me",
  adminDefaultUsername: process.env.ADMIN_DEFAULT_USERNAME || "admin",
  adminDefaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || "ChangeMe123!",
  trustProxy: parseBoolean(process.env.TRUST_PROXY, false),
  corsAllowedOrigins: parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS),
  sessionCookieSameSite: normalizeSameSite(
    process.env.SESSION_COOKIE_SAME_SITE,
    isProduction ? "none" : "lax"
  ),
  sessionCookieSecure: parseBoolean(process.env.SESSION_COOKIE_SECURE, isProduction)
};

module.exports = env;
