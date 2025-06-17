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
  getUnansweredDoubts
} from '../Controllers/Doubts.Controller.js';

import { jwtverify } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.middleware.js";

const router = Router();

// Create a new doubt
router
  .route("/create")
  .post(jwtverify, upload.fields([{ name: "questionPhoto", maxCount: 1 }]), createDoubt);

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

// Get unanswered doubts
router
  .route("/unanswered")
  .get(jwtverify, getUnansweredDoubts);

// Get doubt by ID
router
  .route("/:doubtId")
  .get(jwtverify, getDoubtById);

// Answer a doubt
router
  .route("/answer/:doubtId")
  .post(jwtverify, upload.fields([
    { name: "answerPhoto", maxCount: 1 },
    { name: "answerVideo", maxCount: 1 }
  ]), answerDoubt);

// Delete doubt
router
  .route("/delete/:doubtid")
  .delete(jwtverify, deleteDoubt);

export default router;
