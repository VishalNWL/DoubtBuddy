import mongoose from "mongoose"
import { ClassInfo } from "../Models/ClassInfo.model.js"
import {asyncHandler} from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/Apierrors.js";
import { Apiresponse } from "../Utils/Apiresponse.js";

//add class
//update subjects


const addClass= asyncHandler(async(req,res)=>{
    try {

        const {Class , school,subjects}=req.body;

         school.trim();

         if(!Class&&!school&&!subjects){
            res.status(400).json(new Apiresponse(400,{},"All fields are required"));
        }
        
        const findclass= await ClassInfo.find({
            $and:[{class:Class},{school}]
        })
        
        if(!findclass){
            res.status(400).json(new Apiresponse(400,{},"Class already exist"));
        }
        
        const newclass=await ClassInfo.create({
            school:school,
            class:Class,
            subjects:subjects
        })
        
        if(!newclass){
            res.status(400).json(new Apiresponse(400,{},"There is some error while creatig newclass"));
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
            res.status(400).json(new Apiresponse(400,{},"All fields are required"));
        }
        
        const findclass= await ClassInfo.find({
            $and:[{class:Class},{batch},{school}]
        })
        
        if(!findclass){
            res.status(400).json(new Apiresponse(400,{},"Class dosen't exist"));
        }
        
        findclass.subjects=subject;
        await findclass.save();
        
        res.status(200)
        .json(new Apiresponse(200,findclass,"Class updated successfully"));
        
    } catch (error) {
        throw new ApiError(500,"There is some error while updating subjects"+error.message);
    }
})
const getsubject=asyncHandler(async(req,res)=>{
    try {
        const {Class}=req.body;
    
        if(!Class){
           return res.status(400).json(new Apiresponse(400,{},"Class required"));
        }
        
        const findclass= await ClassInfo.findOne({class:Class})
        
       
        if(!findclass){
           return res.status(400).json(new Apiresponse(400,{},"Class dosen't exist"));
        }
        
        const subjects = findclass.subjects;
     
       return res.status(200)
        .json(new Apiresponse(200,subjects,"Subjects fetched Successfully"));
        
    } catch (error) {
        throw new ApiError(500,"There is some error while fetching subjects"+error.message);
    }
})


export {
    addClass,
    updateClass,
    getsubject
}
