import { Router } from "express";
import { getStudentsByClass, getTeachersByClass, getUserProfileForSchool } from "../Controllers/School.Controller.js";
import { jwtverify } from "../Middlewares/auth.middleware.js";


const router = Router();


router
 .route('/students')
 .post(jwtverify,getStudentsByClass);


 router
 .route('/teachers')
 .post(jwtverify,getTeachersByClass);

 router
 .route('/profile/:userId')
 .get(jwtverify,getUserProfileForSchool)



 export default router