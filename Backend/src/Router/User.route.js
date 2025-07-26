import { Router} from "express";
import {
  getAllStudentsBySchool,
  getStudentsByClassAndBatch,
  getStudentsByClassBatchSubject,
  getAllTeachersBySchool,
  getTeachersByClassAndBatch,
  getTeachersByClassBatchSubject
}   from '../Controllers/User.Controller.js'

import {jwtverify} from '../Middlewares/auth.middleware.js'

const router= Router();

router.route('/get-all-student-by-School').get(jwtverify,getAllStudentsBySchool);
router.route('/get-student-by-CB').get(jwtverify,getStudentsByClassAndBatch);
router.route('/get-student-by-CBS').get(jwtverify,getStudentsByClassBatchSubject);
router.route('/get-teachers-by-School').get(jwtverify,getAllTeachersBySchool);
router.route('/get-teachers-by-CB').get(jwtverify,getTeachersByClassAndBatch);
router.route('/get-teacher-by-CBS').get(jwtverify,getTeachersByClassBatchSubject);

export default router;
