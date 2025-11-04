// backend/middlewares/arcjet.middleware.js - DEBUG VERSION
console.log("🔒 Arcjet: Middleware loaded - NODE_ENV:", process.env.NODE_ENV);
console.log("🔒 Arcjet: ARCJET_KEY exists:", !!process.env.ARCJET_KEY);

let aj = null;

// Only try to initialize in development with proper key
if (process.env.NODE_ENV === "development" && process.env.ARCJET_KEY) {
  try {
    const arcjet = (await import("@arcjet/node")).default;
    aj = arcjet({
      key: process.env.ARCJET_KEY,
      characteristics: [],
      rules: [],
    });
    console.log("🔒 Arcjet: Successfully initialized");
  } catch (error) {
    console.error("🔒 Arcjet: Initialization failed:", error.message);
    aj = null;
  }
}

const arcjetMiddleware = async (req, res, next) => {
  // Skip in production or if not initialized
  if (!aj) {
    return next();
  }

  try {
    console.log("🔒 Arcjet: Processing request");

    // Check if protect method exists
    if (typeof aj.protect !== "function") {
      console.error("🔒 Arcjet: protect method not found");
      return next();
    }

    const decision = await aj.protect(req, {
      ip: req.ip || "127.0.0.1",
    });

    console.log("🔒 Arcjet Decision:", decision.isDenied());
    next();
  } catch (error) {
    console.error("🔒 Arcjet Error:", error.message);
    next();
  }
};

export default arcjetMiddleware;
