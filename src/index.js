import dotenv from "dotenv"
dotenv.config({
    path:'./.env'
})

import {app} from './app.js'
import dbconnection from './DB/index.js'
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
   cloud_name:process.env.cloud_name, 
   api_key:process.env.api_key, 
   api_secret:process.env.api_secret
})


dbconnection()
.then(()=>{
   app.listen(process.env.PORT,()=>{
    console.log("Server is listening on the port ",process.env.PORT);
   })
})
.catch((error)=>{
    console.log("There is some error while connecting with database", error);
})