import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { app } from "./app.js";
import dbconnection from "./DB/index.js";
import { v2 as cloudinary } from "cloudinary";
import serverless from "serverless-http"; // ✅ this is key

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

(async () => {
  try {
    await dbconnection(); // ✅ wait for DB connection before serving
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1);
  }
})();
