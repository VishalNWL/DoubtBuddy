import dotenv from "dotenv";
dotenv.config({ path: "./src/.env" });

import { app } from "./src/app.js";
import dbconnection from "./src/DB/index.js";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import { Server } from "socket.io";
import { socketAuth } from "./src/sockets/socketAuth.js";
import registerDiscussionHandlers from "./src/sockets/discussion.js";

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const PORT = process.env.PORT;

dbconnection().then(() => {
  // 1) Create raw HTTP server
  const server = http.createServer(app);

  // 2) Attach Socket.IO to it
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://doubt-buddy.vercel.app",
        "https://doubt-buddy-mo9f.vercel.app",
        /\.vercel\.app$/, // allow preview deployments
      ],
      credentials: true,
    },
  });

  // 3) Use socket auth middleware
  io.use(socketAuth);

  // 4) Register handlers
  io.on("connection", (socket) => {
    registerDiscussionHandlers(io, socket);
  });


  // 5) Start HTTP + WS server
  server.listen(PORT, () => {
    console.log(`Server running with REST + WebSocket on port ${PORT}`);
  });
}); 
