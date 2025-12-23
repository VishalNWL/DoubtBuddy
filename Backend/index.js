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

const PORT = process.env.PORT;

dbconnection().then(() => {
  // 1) Create raw HTTP server
    app.listen(PORT,()=>{
        console.log("server is listening on the port ",PORT);
    })
}); 
