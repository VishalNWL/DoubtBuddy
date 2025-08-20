import dotenv from "dotenv";
dotenv.config({ path: "./src/.env" });

import { app } from "./src/app.js";
import dbconnection from "./src/DB/index.js";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});


dbconnection().then(
  app.listen(process.env.PORT,()=>{
    console.log("Server is running on the port",process.env.PORT)
  })
)
