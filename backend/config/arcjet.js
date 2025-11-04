// import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
// import { ARCJET_KEY } from "./env.js";

// const aj = arcjet({
//   key: ARCJET_KEY,
//   rules: [
//     shield({ mode: "LIVE" }),

//     detectBot({
//       mode: "LIVE",
//       allow: ["CATEGORY:SEARCH_ENGINE"],
//     }),

//     tokenBucket({
//       mode: "LIVE",
//       refillRate: 5, // Refill 5 tokens per interval
//       interval: 10, // Refill every 10 seconds
//       capacity: 10, // Bucket capacity of 10 tokens
//     }),
//   ],
// });

// export default aj;
// backend/middlewares/arcjet.middleware.js
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";

const aj =
  process.env.NODE_ENV === "development" && process.env.ARCJET_KEY
    ? arcjet({
        key: process.env.ARCJET_KEY,
        characteristics: ["ip"],
        rules: [
          shield({ mode: "DRY_RUN" }),
          detectBot({
            mode: "DRY_RUN",
            allow: ["CATEGORY:SEARCH_ENGINE"],
          }),
          tokenBucket({
            mode: "DRY_RUN",
            refillRate: 5,
            interval: 10,
            capacity: 10,
          }),
        ],
      })
    : null;

const arcjetMiddleware = async (req, res, next) => {
  // Skip Arcjet completely in production
  if (process.env.NODE_ENV === "production") {
    console.log("🔒 Arcjet: Skipped in production");
    return next();
  }

  if (!aj) {
    console.log("🔒 Arcjet: Not initialized (no API key)");
    return next();
  }

  try {
    console.log("🔒 Arcjet: Processing request in development");

    const decision = await aj.protect(req, {
      ip: req.ip || req.connection.remoteAddress || "127.0.0.1",
    });

    // Log the decision but don't block in development
    console.log("🔒 Arcjet Decision:", {
      isDenied: decision.isDenied(),
      reason: decision.reason,
      results: decision.results,
    });

    if (decision.isDenied()) {
      console.warn(
        "🔒 Arcjet: Would block request in production:",
        decision.reason
      );
    }

    next();
  } catch (error) {
    console.error("🔒 Arcjet Error:", error.message);

    next();
  }
};

export default arcjetMiddleware;
