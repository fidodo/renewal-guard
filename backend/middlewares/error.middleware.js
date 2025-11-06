const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;
    console.error(err);

    // Mongoose bad ObjectId error
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`;
      error = new Error(message);
      error.statusCode = 404;
    }
    // Mongoose duplicate key error
    if (err.code === 11000) {
      const message = `Duplicate field value entered: ${err.keyValue.name}`;
      error = new Error(message);
      error.statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      error = new Error(message.join(", "));
      error.statusCode = 400;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
      error.statusCode = 401;
      error.code = "INVALID_TOKEN";
    }

    if (err.name === "TokenExpiredError") {
      const isRefreshToken = err.stack?.includes("refreshAuthToken");
      error.statusCode = 401;
      error.code = isRefreshToken ? "REFRESH_TOKEN_EXPIRED" : "TOKEN_EXPIRED";
      error.message = isRefreshToken
        ? "Refresh token expired, please login again"
        : "Token expired";
    }
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || "Server Error",
      code: error.code || "INTERNAL_SERVER_ERROR",

      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
