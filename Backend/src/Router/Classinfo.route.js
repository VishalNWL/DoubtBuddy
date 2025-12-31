import { Router } from "express";

import {
  addClass,
  updateClass,
  getSubjects,
  getClassesForSchool
} from "../Controllers/Subjects.Controller.js";

import { jwtverify } from "../Middlewares/auth.middleware.js";

const router = Router();

/**
 * Add a new class with subjects
 */
router.route("/add-class").post(jwtverify, addClass);

/**
 * Update subjects / optional subjects for a class
 */
router.route("/update-class").post( jwtverify, updateClass);

/**
 * Get subjects for a class (and stream)
 * example:
 *  /get-subjects?school=ABC&Class=11&stream=Science
 */
router.route("/get-subjects").post(jwtverify, getSubjects);

/**
 * Get all classes registered in a school
 * example:
 *  /classes?school=ABC
 */
router.route("/classes").get(jwtverify, getClassesForSchool);

export default router;
