import mongoose from "mongoose"
import { ClassInfo } from "../Models/ClassInfo.model"
import {asyncHandler} from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/Apierrors.js";
import { Apiresponse } from "../Utils/Apiresponse.js";

//add class
//update subjects


const addClass= asyncHandler(async(req,res)=>{
    try {

        const {Class , batch , school,subject}=req.body;

         school.trim();

         if(!Class&& !batch&&!school&&!subject){
            throw new ApiError(400,"All fields are required");
         }

         const findclass= await ClassInfo.find({
            $and:[{class:Class},{batch},{school}]
         })

         if(findclass){
            throw new ApiError(400,"Class already exist");
         }

    const newclass=await ClassInfo.create({
        school:school,
        batch:batch,
        class:Class,
        subjects:subject
    })

    if(!newclass){
        throw new ApiError(500,"There is some error while creatig newclass");
    }

    res.status(200)
    .json(new Apiresponse(200,newclass,"Class created successfully"));
        
    } catch (error) {
        throw new ApiError(500,"There is some error while adding subjects"+error.message);
    }
})


const updateClass=asyncHandler(async(req,res)=>{
    try {
      const {school,Class,batch, subject}=req.body;
      
      if(!Class&& !batch && !school && !subject){
            throw new ApiError(400,"All fields are required");
         }
     
          const findclass= await ClassInfo.find({
            $and:[{class:Class},{batch},{school}]
         })

         if(!findclass){
            throw new ApiError(400,"Class dosen't exist");
         }

         findclass.subjects=subject;
        await findclass.save();
          
      res.status(200)
      .json(new Apiresponse(200,findclass,"Class updated successfully"));

    } catch (error) {
        throw new ApiError(500,"There is some error while updating subjects"+error.message);
    }
})


export {
    addClass,
    updateClass
}