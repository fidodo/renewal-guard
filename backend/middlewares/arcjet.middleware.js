import aj from "../config/arcjet.js";

const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit())
        return res
          .status(429)
          .json({ success: false, message: "Rate Limit Exceeded" });
      if (decision.reason.isBot())
        return res
          .status(403)
          .json({ success: false, message: "Access Denied for Bots" });
      return res.status(403).json({ success: false, message: "Access Denied" });
    }
    next();
  } catch (error) {
    console.error(`Arcjet Middleware Error: ${error}`);
    next(error);
  }
};
export default arcjetMiddleware;
