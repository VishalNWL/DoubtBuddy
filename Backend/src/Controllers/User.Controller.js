import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/Apierrors.js";
import { User } from "../Models/user.model.js";
import { Apiresponse } from "../Utils/Apiresponse.js";

// Get all students of a school
const getAllStudentsBySchool = asyncHandler(async (req, res) => {
  const { school } = req.params;

  if (!school) {
    res.status(400).json(new Apiresponse(400,{},"School name is required"));
  }
  
  const students = await User.find({ role: "student", school });
  
  res.status(200).json(new Apiresponse(200, students, "All students fetched"));
});

// Get all students of a school → class → batch
const getStudentsByClassAndBatch = asyncHandler(async (req, res) => {
  const { school, className, batch } = req.params;
  
  if (!school || !className || !batch) {
    res.status(400).json(new Apiresponse(400,{}, "School, class and batch are required"));
  }
  
  const students = await User.find({
    role: "student",
    school,
    class: className,
    batch: batch
  });
  
  res.status(200).json(new Apiresponse(200, students, "Filtered students fetched"));
});

// Get all students of a school → class → batch → subject
const getStudentsByClassBatchSubject = asyncHandler(async (req, res) => {
  const { school, className, batch, subject } = req.params;
  
  if (!school || !className || !batch || !subject) {
    res.status(400).json(new Apiresponse(400,{},"All parameters required"));
  }
  
  const students = await User.find({
    role: "student",
    school,
    class: className,
    batch: batch,
    subjects: subject // Assuming 'subjects' is an array in student schema
  });

  res.status(200).json(new Apiresponse(200, students, "Filtered students by subject"));
});

// Get all teachers of a school
const getAllTeachersBySchool = asyncHandler(async (req, res) => {
  const { school } = req.params;
  
  if (!school) {
    res.status(400).json(new Apiresponse(400,{}, "School name is required"));
  }
  
  const teachers = await User.find({ role: "teacher", school });
  
  res.status(200).json(new Apiresponse(200, teachers, "All teachers fetched"));
});

// Get all teachers of a class → batch
const getTeachersByClassAndBatch = asyncHandler(async (req, res) => {
  const { school, className, batch } = req.params;
  
  const teachers = await User.find({
    role: "teacher",
    school,
    teacherClasses: {
      $elemMatch: {
        class: className,
        batches: batch
      }
    }
  });
  
  res.status(200).json(new Apiresponse(200, teachers, "Teachers filtered by class and batch"));
});

// Get all teachers of a class → batch → subject
const getTeachersByClassBatchSubject = asyncHandler(async (req, res) => {
  const { school, className, batch, subject } = req.params;
  
  const teachers = await User.find({
    role: "teacher",
    school,
    teacherClasses: {
      $elemMatch: {
        class: className,
        batches: batch,
        subject: subject
      }
    }
  });
  
  res.status(200).json(new Apiresponse(200, teachers, "Teachers filtered by class, batch and subject"));
});


export {
  getAllStudentsBySchool,
  getStudentsByClassAndBatch,
  getStudentsByClassBatchSubject,
  getAllTeachersBySchool,
  getTeachersByClassAndBatch,
  getTeachersByClassBatchSubject,
  
};


