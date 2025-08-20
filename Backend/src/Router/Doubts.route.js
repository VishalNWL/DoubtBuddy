import { Router } from "express";
import {
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
  getTotalDoubtForTeacher
} from '../Controllers/Doubts.Controller.js';

import { jwtverify } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.middleware.js";

const router = Router();

// Create a new doubt
router
  .route("/create")
  .post(jwtverify, upload.single("questionPhoto"), createDoubt); 

// Get all doubts (admin or dashboard)
router
  .route("/all")
  .get(jwtverify, getAllDoubts);

// Get doubts by student
router
  .route("/by-student")
  .post(jwtverify, getDoubtsByStudent);

// Get doubts by subject (admin)
router
  .route("/by-subject/admin")
  .post(jwtverify, getDoubtsBySubjectAdmin);

// Get doubts by subject (student)
router
  .route("/by-subject/student")
  .post(jwtverify, getDoubtsBySubject_student);

// Get doubts by subject (teacher with class + batch)
router
  .route("/by-subject/teacher")
  .post(jwtverify, getDoubtsBySubject_teacher);

// Get doubts by subject (teacher with class + batch)
router
  .route("/teachertotaldoubt")
  .get(jwtverify, getTotalDoubtForTeacher);

// Get unanswered doubts
router
  .route("/unanswered")
  .get(jwtverify, getUnansweredDoubts);

// Get doubt by ID
router
  .route("/doubtbyid")
  .post(jwtverify, getDoubtById);

// Answer a doubt
router
  .route("/answer")
  .post(jwtverify, upload.fields([
    { name: "answerPhoto", maxCount: 1 },
    { name: "answerVideo", maxCount: 1 }
  ]), answerDoubt);

// Delete doubt
router
  .route("/delete")
  .post(jwtverify, deleteDoubt);

export default router;
