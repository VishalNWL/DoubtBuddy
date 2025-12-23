import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const dbconnection=async ()=>{
    try {
        const dbconnectioninstance=await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`);
        console.log(dbconnectioninstance.connection.host);
        console.log("Database connected successfully");
    } catch (error) {
        console.log("MongoDB connection error :", error);
        process.exit(1);
    }
} 

export default dbconnection;