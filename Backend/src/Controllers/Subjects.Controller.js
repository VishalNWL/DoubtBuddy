import mongoose from "mongoose"
import { ClassInfo } from "../Models/ClassInfo.model.js"
import {asyncHandler} from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/Apierrors.js";
import { Apiresponse } from "../Utils/Apiresponse.js";

//add class

const addClass = asyncHandler(async (req, res) => {

  const { school, Class, stream, subjects, OptionalSubjects } = req.body;

  // ---------- validation ----------
  if (!school || !Class || !subjects?.length) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "School, Class & Subjects are required"));
  }

  if (Class >= 11 && !stream) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "Stream is required for Class 11 & 12"));
  }

  const schoolTrimmed = school.trim();

  // ---------- duplicate check ----------
  const exists = await ClassInfo.findOne({
    school: schoolTrimmed,
    class: Class,
    stream: stream || null
  });

  if (exists) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "Class already exists"));
  }

  // ---------- create ----------
  const created = await ClassInfo.create({
    school: schoolTrimmed,
    class: Class,
    stream: stream || null,
    subjects,
    OptionalSubjects: OptionalSubjects || []
  });

  return res
    .status(201)
    .json(new Apiresponse(201, created, "Class created successfully"));
});


const updateClass = asyncHandler(async (req, res) => {

  const { school, Class, stream, subjects, OptionalSubjects } = req.body;

  if (!school || !Class) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "School & Class are required"));
  }

  const schoolTrimmed = school.trim();

  const classDoc = await ClassInfo.findOne({
    school: schoolTrimmed,
    class: Class,
    stream: stream || null
  });

  if (!classDoc) {
    return res
      .status(404)
      .json(new Apiresponse(404, {}, "Class not found"));
  }

  if (subjects) classDoc.subjects = subjects;
  if (OptionalSubjects) classDoc.OptionalSubjects = OptionalSubjects;

  await classDoc.save();

  return res
    .status(200)
    .json(new Apiresponse(200, classDoc, "Class updated successfully"));
});

const getSubjects = asyncHandler(async (req, res) => {

  const { school, Class, stream } = req.body;

  if (!school || !Class) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "School & Class are required"));
  }

  const schoolTrimmed = school.trim();

  const classDoc = await ClassInfo.findOne({
    school: schoolTrimmed,
    class: Class,
    stream: stream || null
  });

  if (!classDoc) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "Class subjects not found"));
  }

  return res
    .status(200)
    .json(
      new Apiresponse(
        200,
        classDoc,
        "Subjects fetched successfully"
      )
    );
});

const getClassesForSchool = asyncHandler(async (req, res) => {

  const { school } = req.query;

  if (!school) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "School required"));
  }

  const schoolTrimmed = school.trim();

  const classes = await ClassInfo.find(
    { school: schoolTrimmed },
    { class:1, stream:1, _id:0 }
  ).sort({ class:1 });

  return res
    .status(200)
    .json(new Apiresponse(200, classes, "Classes fetched successfully"));
});

export {
  addClass,
  updateClass,
  getSubjects,
  getClassesForSchool
};
