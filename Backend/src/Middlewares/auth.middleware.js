import {ApiError} from "../Utils/Apierrors.js"
import {asyncHandler} from "../Utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../Models/user.model.js"


const jwtverify= asyncHandler(async (req,_ , next)=>{
     try {
        console.log("This is working");
        const token = req.cookies?.accessToken || req.headers['Authorization']?.replace('Bearer ', '');
        console.log("This is token",token)
        if(!token){
           throw new  ApiError(400, "Unauthorized Access");
        }

        const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user= await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(404,"Invalid user");
        }

        req.user=user;
        next();

     } catch (error) {
        console.log(error.message);
        throw new ApiError(500,"Something went wrong while jwt verify"+error);
     }
})

export {jwtverify};