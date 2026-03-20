const { ApiError } = require("../utils/errors");

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err instanceof ApiError ? err.statusCode : 500;
  const payload = {
    message: err.message || "Internal server error"
  };

  if (err instanceof ApiError && err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  return res.status(status).json(payload);
}

module.exports = errorHandler;
