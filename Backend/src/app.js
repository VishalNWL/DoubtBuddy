import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";


config({
  path:'./.env'
})
const app = express();

// Middleware
const allowedOrigins = [
  process.env.FrontEndURL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("Public"));
app.use(cookieParser());

// Routes
import authRouter from './Router/Auth.route.js';
import classInfoRouter from './Router/Classinfo.route.js';
import doubtsRouter from './Router/Doubts.route.js';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/classinfo', classInfoRouter);
app.use('/api/v1/doubts', doubtsRouter);

// Optional 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
 
export {app};
   