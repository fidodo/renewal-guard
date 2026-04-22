import express from "express";
import cookieParser from "cookie-parser";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";

import {
  generalLimiter,
  authLimiter,
} from "./middlewares/rateLimit.middleware.js";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import workflowRouter from "./routes/workflow.routes.js";
import cors from "cors";
import { PORT } from "./config/env.js";
import setupSwagger from "./swagger.js";
import searchRouter from "./routes/search.routes.js";
import settingRouter from "./routes/setting.routes.js";
import openaiRouter from "./routes/openai.routes.js";
import passport from "passport";
import "./controller/auth.controller.js";

const app = express();
// ✅ CORS setup
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.use(generalLimiter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/openai", openaiRouter);
app.use("/api/v1/workflows", workflowRouter);
app.use("/api/v1/settings", settingRouter);
app.use("/api-docs", express.static("public"));
app.use("/api/v1/search", searchRouter);

app.use(errorMiddleware);
setupSwagger(app);
app.get("/", (req, res) => {
  res.send("Hello World ");
});

app.listen(PORT, async () => {
  console.log(`Server is running on port http://localhost:${PORT}`);

  await connectToDatabase();
});
