// Custom error class so controllers can throw errors with a specific HTTP status.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Wraps an async route handler so rejected promises are forwarded to next().
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Express error-handling middleware (must have 4 args).
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error("[error]", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ message });
  }

  // Mongoose invalid ObjectId cast
  if (err.name === "CastError") {
    return res.status(400).json({ message: `Invalid identifier: ${err.value}` });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({ message });
}

// 404 handler for unknown routes.
function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { ApiError, asyncHandler, errorHandler, notFoundHandler };
