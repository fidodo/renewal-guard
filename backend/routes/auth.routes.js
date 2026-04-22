import { Router } from "express";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import {
  signUp,
  signIn,
  signOut,
  userMe,
  refreshAuthToken,
  googleAuth,
  googleAuthCallback,
} from "../controller/auth.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.get("/test", (req, res) => {
  res.json({ message: "Auth router is working!", timestamp: new Date() });
});

authRouter.post("/sign-up", authLimiter, signUp);

authRouter.post("/sign-in", authLimiter, signIn);

authRouter.post("/sign-out", signOut);

authRouter.post("/refresh-token", refreshAuthToken);

authRouter.get("/me", authorize, userMe);

// New google Oauth routes
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleAuthCallback);
export default authRouter;
