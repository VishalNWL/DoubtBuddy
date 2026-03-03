import { Router } from "express";
import { getStudentsByClass, getTeachersByClass, getUserProfileForSchool,getSchoolDetailByUniqueId, getClassStudentTeacherCount } from "../Controllers/School.Controller.js";
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

 router
 .route('/schoolInfo')
 .post(getSchoolDetailByUniqueId)

 router
 .route('/student-teacher-count')
 .post(jwtverify,getClassStudentTeacherCount)



 export default router