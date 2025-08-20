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

import { asyncHandler } from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/Apierrors.js"
import { Doubt } from "../Models/Doubts.model.js"
import { uploadOnCloudinary } from "../Utils/cloudinary.js"
import { Apiresponse } from "../Utils/Apiresponse.js"
import { getcurrentuser } from "./Auth.Controller.js"
import { User } from "../Models/user.model.js"


//createDoubt

const createDoubt = asyncHandler(async (req, res) => {
  try {
    const user = req.user

    if (!user) {
      res.status(400).json(new Apiresponse(400, {}, "User not found"));
    }

    const student = await User.findById(user._id);

    const { questionDescription, subject, title } = req.body;

    const questionfilepath = req.file?.path;

    let questionfile = '';
    if (questionfilepath) {
      questionfile = await uploadOnCloudinary(questionfilepath);
    }

    if (!questionDescription && !questionfilepath) {
      res.status(400).json(new Apiresponse(400, {}, "There is no question entered"));
    }

    const question = await Doubt.create({
      title: title,
      studentname: user.username,
      questionDescription: questionDescription,
      questionFile: questionfile.url,
      askedBy: user._id,
      subject: subject,
      class: user.class,
      batch: user.batch
    })

    student.AskedQuestions = [...student.AskedQuestions,question];
    await student.save();

    res.status(200)
      .json(new Apiresponse(200, question, "Doubt created Successfully"));
  }

  catch (error) {
    console.log(error.message);
    throw new ApiError(400, "There is something wrong happened while creating the Doubt");

  }

})


//Get Doubts by student by id

const getDoubtsByStudent = asyncHandler(async (req, res) => {
  const student = req.body.studentId;

  const doubtsbystudent = await Doubt.find({ askedBy: student });

  if (!doubtsbystudent) {
    res.status(400).json(new Apiresponse(400, {}, "There is no doubt asked by this student"));
  }

  res.status(200)
    .json(new Apiresponse(200, doubtsbystudent, "Doubts fetched successfylly"));
})

//# Doubts by Subject

//1. this is doubts fetched for admin
const getDoubtsBySubjectAdmin = asyncHandler(async (req, res) => {
  const { subject } = req.body;

  const doubts = await Doubt.find({ subject: subject });

  if (!doubts) {
    res.status(400).json(new Apiresponse(400, {}, "There are not doubts in this subject"));
  }

  res.status(200)
    .json(new Apiresponse(200, doubts, "Doubts fetched successfully"));
})


//2.This is doubts fetched for student in particular subject
const getDoubtsBySubject_student = asyncHandler(async (req, res) => {
  try {
    const studentId = req.user._id;
    const subject = req.body.subject;

    if (!studentId) {
      res.status(400).json(new Apiresponse(400, {}, "Student is not logged in"));
    }

    if (!subject) {
      res.status(400).json(new Apiresponse(400, {}, "Subject required"));
    }

    const doubts = await Doubt.find({
      $and: [{ askedBy: studentId }, { subject: subject }]
    })

    if (!doubts) {
      res.status(400).json(new Apiresponse(400, {}, "There is no doubts asked by this student in the given subject"));
    }

    req.status(200)
      .json(new Apiresponse(200, doubts, "Doubts fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
})


//3.This is doubts fetched for teacher with particular subject, class and Batch

const getDoubtsBySubject_teacher = asyncHandler(async (req, res) => {
  try {
    const { subject, Class, batch } = req.body;

    if (!subject || !Class || !batch) {
      res.status(400).json(new Apiresponse(400, {}, "All fields are required"));
    }

    const doubts = await Doubt.find({
      $and: [{ subject: subject, class: Class, batch: batch, status: "unanswered" }]
    }).sort({ createdAt: -1 });

    if (!doubts) {
      res.status(400).json(new Apiresponse(400, {}, "Thre is no doubts in the given subject"));
    }

    res.status(200)
      .json(new Apiresponse(200, doubts, "Doubts fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
})

//#get total no. of count for a teacher
const getTotalDoubtForTeacher = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(400).json(new Apiresponse(400, {}, "Unauthorized request"));
    }

const allowedPairs = user.teacherClasses.map(entry => ({
  class: entry.class,
  batch: entry.batch
}));

   const totalDoubt = await Doubt.find({
  $or: allowedPairs
});


    // user.teacherClasses.forEach(async (i) => {
    //          sum= await Doubt.aggregate([
    //       {$match:{class:`${i.class}`, batch:`${i.batch}`,subject:`${i.subject}`}},
    //       {$count:'total'}
    //      ]) 

    //  if(sum){
    //     totalcount+= sum[0].total;
    //  }
    // })

    res.status(200)
      .json(new Apiresponse(200, totalDoubt, "Total doubt of teacher fetched successfully"));
  } catch (error) {
    console.log(error)
    throw new ApiError(500, "Some error occured");
  }

})

//#getting pending doubt for an teacher
const teacherpendingdoubt = asyncHandler(async (req, res) => {
  try {
    const user = getcurrentuser();
    if (!user) {
      res.status(400).json(new Apiresponse(400, {}, "Unauthorized request"));
    }

    totalcount = 0;

    user.teacherClasses.forEach(async (i) => {
      sum = await Doubt.aggregate([
        { $match: { class: `${i.class}`, batch: `${i.batch}`, subject: `${i.subject}`, status: 'unanswered' } },
        { $count: 'total' }
      ])

      if (sum) {
        totalcount += sum[0].total;
      }
    })

    res.status(200)
      .json(new Apiresponse(200, totalcount, "Total doubt of teacher fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Some error occured", error.message);
  }
})

//4. Fetching doubts with an particular id
const getDoubtById = asyncHandler(async (req, res) => {
  const { doubtId } = req.body;

  if (!doubtId) {
    res.status(400).json(new Apiresponse(400, {}, "Doubt id required"));
  }

  const doubt = await Doubt.findById(doubtId);

  if (!doubt) {
    res.status(400).json(new Apiresponse(400, {}, "Invalid doubt id"));
  }

  res.status(200)
    .json(new Apiresponse(200, doubt, "Doubt fetched successfully"));
})


//# Delete doubt

const deleteDoubt = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(400).json(new Apiresponse(400, {}, "Student not logged in"));
  }

  const { doubtid } = req.body;

  const doubt = await Doubt.findOneAndDelete({
    $and: [{ askedBy: req.user._id }, { _id: doubtid }]
  })

  if (!doubtid) {
    res.status(400).json(new Apiresponse(400, {}, "Doubt cannot be deleted"));
  }

  res.status(200)
    .json(new Apiresponse(200, doubt, "Doubt deleted successfylly"));
})

//# Fetching all doubts for the admin dashbord purpose

const getAllDoubts = asyncHandler(async (req, res) => {
  const doubts = await Doubt.find({
    $or: [{ status: "answered" }, { status: "unanswered" }]
  }).sort({ createdAt: 1 });

  if (!doubts) {
    res.status(400).json(new Apiresponse(400, {}, "There are no doubts present at this moment"));
  }

  res.status(200)
    .json(200, doubts, "All doubts fetched successfully");
})


//#answerDoubt

const answerDoubt = asyncHandler(async (req, res) => {

  try {
    const user = req.user;
    if (!user) {
     return res.status(400).json(new Apiresponse(400, {}, "User not logged in"));
    }

    const teacher = await User.findById(user._id);

    const { answerText="", doubtId } = req.body;
    

const answerPhotopath = req.files?.answerPhoto?.[0]?.path || "";
const answerPhotoURL = answerPhotopath ? await uploadOnCloudinary(answerPhotopath) : "";

const answerVideopath = req.files?.answerVideo?.[0]?.path || "";
const answerVideoURL = answerVideopath ? await uploadOnCloudinary(answerVideopath) : "";


    if (!answerText && !answerPhotoURL && !answerVideoURL) {
      return res.status(400).json(new Apiresponse(400, {answerText,answerPhotoURL,answerVideoURL}, "Answer is not valid"));
    }

    const updatedDoubt = await Doubt.findByIdAndUpdate(
      doubtId,
      {
        answer: answerText,
        answerText:answerText,
        answerPhoto: answerPhotoURL.url||"",
        answerVideo: answerVideoURL.url||"",
        answeredBy: user._id,
        status: "answered",
      },
      { new: true } // Return updated document
    );
    
    //updating teacher 
     teacher.answeredQuestions = [...teacher.answeredQuestions,doubtId];
      await teacher.save();

    if (!updatedDoubt) {
     return res.status(400).json(new Apiresponse(400, {}, "Doubt not found"));
    }

   return res.status(200).json(new Apiresponse(200,updatedDoubt,"Doubt solved Successfully"));
  } catch (error) {
    console.log(error)
    res.status(500).json(new Apiresponse(500, error, "Something went wrong"));
  }


})


//#getunansweredDoubts
const getUnansweredDoubts = asyncHandler(async (req, res) => {
  const doubts = await Doubt.find({ status: "unanswered" });

  if (!doubts || doubts.length === 0) {
    res.status(400).json(new Apiresponse(400, {}, "No unaswered doubts found"));
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
  getUnansweredDoubts,
  getTotalDoubtForTeacher,
  teacherpendingdoubt
}
