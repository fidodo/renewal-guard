import rateLimit from "express-rate-limit";

const shouldSkip = (req) => {
  // Skip entirely in development
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  return false;
};

// General rate limiter for all routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV === "development" && req.ip === "127.0.0.1") {
      return true;
    }
    return false;
  },
});

// Strict rate limiter for auth endpoints (login, signup)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for localhost in development
    if (process.env.NODE_ENV === "development" && req.ip === "127.0.0.1") {
      return true;
    }
    return false;
  },
});

// Very strict limiter for sensitive operations
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many sensitive operations, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
