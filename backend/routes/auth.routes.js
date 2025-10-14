import { Router } from "express";
import {
  signUp,
  signIn,
  signOut,
  userMe,

} from "../controller/auth.controller.js";

const authRouther = Router();

authRouther.post("/sign-up", signUp);

authRouther.post("/sign-in", signIn);

authRouther.post("/sign-out", signOut);

authRouther.get("/me", userMe);
export default authRouther;
