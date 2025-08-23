import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import helmet from 'helmet'

config({ path: "./.env" });
const app = express();

console.log("Frontend URL from env:", process.env.FRONTEND_URL);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://doubt-buddy.vercel.app",
      "https://doubt-buddy-mo9f.vercel.app"
      ,
      /\.vercel\.app$/, // allow preview deployments
    ],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ✅ Handle preflight requests
app.options("*", cors());

// ✅ Then apply helmet, but disable conflicting policies
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("Public"));
app.use(cookieParser());

// Routes
import authRouter from "./Router/Auth.route.js";
import classInfoRouter from "./Router/Classinfo.route.js";
import doubtsRouter from "./Router/Doubts.route.js";
import uploadRouter from "./Router/upload.route.js";
import discussionRoutes from "./Router/Discussion.route.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/classinfo", classInfoRouter);
app.use("/api/v1/doubts", doubtsRouter);
app.use('/api/file',uploadRouter)
app.use("/api/v1/discussion", discussionRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export { app };
