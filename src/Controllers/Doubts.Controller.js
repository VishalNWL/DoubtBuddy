/*
Function	                                Controller Name

Ask a new doubt	                              createDoubt
Get all doubts (admin or dashboard)	          getAllDoubts
Get doubts by student	                      getDoubtsByStudent
Get doubts by subject	                      getDoubtsBySubject
Get unanswered doubts	                      getUnansweredDoubts
Answer a doubt	                              answerDoubt
Get single doubt (for detail view)	          getDoubtById
Delete doubt (admin or dev)	                  deleteDoubt
*/

import {asyncHandler} from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/Apierrors.js"
import {Doubt} from "../Models/Doubts.model.js"
import {uploadOnCloudinary} from "../Utils/cloudinary.js"
import { Apiresponse } from "../Utils/Apiresponse.js"
import {getcurrentuser} from "./Auth.Controller.js"


//createDoubt

const createDoubt = asyncHandler(async(req,res)=>{
   try {
     const user=getcurrentuser();
 
     if(!user){
         throw new ApiError(404,"User not found");
     }
     
     const {question_description, subject}=req.body;
 
     const questionfilepath=req.files?.questionPhoto[0]?.path;
 
      const questionfile='';
     if(questionfilepath){
       questionfile = await uploadOnCloudinary(questionfilepath);
     }
 
     if(!question_description && !questionfilepath){
         throw new ApiError(400,"There is no question entered");
     }
 
     const question= await Doubt.create({
           questionDescription:question_description,
           questionFile:questionfile,
           askedBy:user._id,
           subject:subject
     })

     res.status(200)
     .json(new Apiresponse(200,question,"Doubt created Successfully"));
   } 

   catch (error) {
    console.log(error.message);
      throw new ApiError(400,"There is something wrong happened while creating the Doubt");
    
   }
    
})


//Get Doubts by student by id

const getDoubtsByStudent= asyncHandler(async(req,res)=>{
    const student= req.body.studentId;

    const doubtsbystudent= await Doubt.find({askedBy:student});

    if(!doubtsbystudent){
        throw new ApiError(404,"There is no doubt asked by this student");
    }
    
    res.status(200)
    .json(new Apiresponse(200,doubtsbystudent,"Doubts fetched successfylly"));
})

//# Doubts by Subject

//1. this is doubts fetched for admin
const getDoubtsBySubjectAdmin=asyncHandler(async(req,res)=>{
    const {subject}= req.body;

    const doubts= await Doubt.find({subject:subject});

    if(!doubts){
        throw new ApiError(404,"There are not doubts in this subject");
    }

    res.status(200)
    .json(new Apiresponse(200,doubts,"Doubts fetched successfully"));
})


//2.This is doubts fetched for student in particular subject
const getDoubtsBySubject_student=asyncHandler(async(req,res)=>{
   try {
     const studentId=req.user._id;
     const subject=req.body.subject;
 
     if(!studentId){
         throw new ApiError(400,"Student is not logged in");
     }
 
     if(!subject){
         throw new ApiError(400,"Subject required");
     }
 
     const doubts=await Doubt.find({
         $and:[{askedBy:studentId}, {subject:subject}]
     })
 
     if(!doubts){
         throw new ApiError(404,"There is no doubts asked by this student in the given subject");
     }
 
     req.status(200)
     .json(new Apiresponse(200,doubts,"Doubts fetched successfully"));
   } catch (error) {
       throw new ApiError(500,error.message);
   }
})


//3.This is doubts fetched for teacher with particular subject, class and Batch

const getDoubtsBySubject_teacher=asyncHandler(async(req,res)=>{
try {
      const {subject,Class,batch}=req.body;
  
      if(!subject || !Class || ! batch){
          throw new ApiError(400,"All fields are required");
      }
  
      const doubts=await Doubt.find({
          $and:[{subject:subject,class:Class, batch:batch, status:"unanswered"}]
      })
  
      if(!doubts){
          throw new ApiError(404,"There is no doubts in the given subject");
      }
  
      res.status(200)
      .json(new Apiresponse(200,doubts,"Doubts fetched successfully"));
} catch (error) {
   throw new ApiError(500,error.message);
}
})


//4. Fetching doubts with an particular id
const getDoubtById= asyncHandler(async(req,res)=>{
   const {doubtId}=req.params;

   if(!doubtId){
    throw new ApiError(400,"Doubt id required");
   }

   const doubt= await Doubt.findById(doubtId);

   if(!doubt){
     throw new ApiError(404, "Invalid doubt id");
   }

   res.status(200)
   .json(new Apiresponse(200,doubt,"Doubt fetched successfully"));
})


//# Delete doubt

const deleteDoubt=asyncHandler(async(req,res)=>{
      if(!req.user){
        throw new ApiError(400,"Student not logged in");
      }

      const {doubtid}= req.params;

      const doubt=await Doubt.findOneAndDelete({
        $and:[{askedBy:req.user._id}, {_id:doubtid}]
      })

      if(!doubtid){
         throw new ApiError(400,"Doubt cannot be deleted");
      }

      res.status(200)
      .json(new Apiresponse(200,doubt,"Doubt deleted successfylly"));
})

//# Fetching all doubts for the admin dashbord purpose

const getAllDoubts=asyncHandler(async(req,res)=>{
    const doubts= await Doubt.find({
        $or:[{status:"answered"},{status:"unanswered"}]
    }).sort({ createdAt: 1 });

    if(!doubts){
        throw new ApiError(404,"There are no doubts present at this moment");
    }

    res.status(200)
    .json(200,doubts,"All doubts fetched successfully");
})


//#answerDoubt

 const answerDoubt=asyncHandler(async(req,res)=>{

 try {
    const user = req.user;
    if(!user){
        throw new ApiError(400,"User is not logged in");
    }


    const { doubtId } = req.params;
    const { answerText } = req.body;

    const answerPhotopath= req.files.answerPhoto[0]?.path;
    const answerPhotoURL= await uploadOnCloudinary(answerPhotopath);

    const answerVideopath=req.files.answerVideo[0]?.path;
    const answerVideoURL=await uploadOnCloudinary(answerVideopath);

    if(!answerText && !answerPhotoURL && ! answerVideoURL){
        throw new ApiError(400, "Answer is not valid");
    }
    
    const updatedDoubt = await Doubt.findByIdAndUpdate(
      doubtId,
      {
        answer: answerText,
        answerPhoto:answerPhotoURL,
        answerVideo:answerVideoURL,
        answeredBy:user._id,
        status: "answered"
      },
      { new: true } // Return updated document
    );

    if (!updatedDoubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    res.status(200).json({ message: "Doubt answered", doubt: updatedDoubt });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }


 })


 //#getunansweredDoubts
 const getUnansweredDoubts = asyncHandler(async (req, res) => {
  const doubts = await Doubt.find({ status: "unanswered" });

  if (!doubts || doubts.length === 0) {
    throw new ApiError(404, "No unanswered doubts found");
  }

  res.status(200).json(new Apiresponse(200, doubts, "Unanswered doubts fetched"));
});


export {
    createDoubt,
    getDoubtsByStudent,
    getDoubtsBySubjectAdmin,
    getDoubtsBySubject_student,
    getDoubtsBySubject_teacher,
    getDoubtById,
    deleteDoubt,
    getAllDoubts,
    answerDoubt,
    getUnansweredDoubts
}