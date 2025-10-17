import { Router } from "express";
import {
  signUp,
  signIn,
  signOut,
  userMe,
  refreshAuthToken,
} from "../controller/auth.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const authRouther = Router();

authRouther.post("/sign-up", signUp);

authRouther.post("/sign-in", signIn);

authRouther.post("/sign-out", signOut);

authRouther.post("/refresh-token", refreshAuthToken);

authRouther.get("/me", authorize, userMe);
export default authRouther;
