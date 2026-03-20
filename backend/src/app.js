const path = require("path");
const express = require("express");
const session = require("express-session");
const SQLiteStoreFactory = require("connect-sqlite3");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const csrf = require("csurf");

const env = require("./config/env");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFound");
const viewController = require("./controllers/viewController");

const app = express();

if (env.trustProxy) {
  app.set("trust proxy", 1);
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

const SQLiteStore = SQLiteStoreFactory(session);
app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: path.resolve(__dirname, "../data")
    }),
    name: "kagc.sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production",
      maxAge: 1000 * 60 * 60 * 12
    }
  })
);

const csrfProtection = csrf();
app.use((req, res, next) => {
  const adminMutating =
    req.path.startsWith("/api/admin/") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    !req.path.endsWith("/login");

  if (!adminMutating && !(req.path === "/api/admin/auth/csrf-token" && req.method === "GET")) {
    return next();
  }

  return csrfProtection(req, res, next);
});

app.get("/", viewController.indexPage);
app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
