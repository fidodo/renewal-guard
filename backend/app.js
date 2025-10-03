import express from "express";
import cookieParser from "cookie-parser";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import workflowRouter from "./routes/workflow.routes.js";
import cors from "cors";
import { PORT } from "./config/env.js";
import setupSwagger from "./swagger.js";
import searchRouter from "./routes/search.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

// ✅ CORS middleware BEFORE routes – configure for your frontend origin
app.use(
  cors({
    origin: "http://localhost:3000", // Exact frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers (add more if needed)
    credentials: true, // Required for cookies/credentials
    maxAge: 86400,
  })
);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/workflows", workflowRouter);
app.use("/api-docs", express.static("public"));
app.use("/api/v1/search", searchRouter);
app.use(cors());

app.use(errorMiddleware);
setupSwagger(app);
app.get("/", (req, res) => {
  res.send("Hello World ");
});

app.listen(PORT, async () => {
  console.log(`Server is running on port http://localhost:${PORT}`);

  await connectToDatabase();
});
