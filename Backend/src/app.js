import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";

config({ path: "./.env" });
const app = express();

console.log("Frontend URL from env:", process.env.FRONTEND_URL);

const allowedOrigins = ['http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin requests (like from curl or server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// ✅ Handle preflight for all routes
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("Public"));
app.use(cookieParser());

// Routes
import authRouter from "./Router/Auth.route.js";
import classInfoRouter from "./Router/Classinfo.route.js";
import doubtsRouter from "./Router/Doubts.route.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/classinfo", classInfoRouter);
app.use("/api/v1/doubts", doubtsRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export { app };
