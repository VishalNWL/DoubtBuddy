import { Router} from "express";
import {
    addClass,
    getsubject,
    updateClass
}   from '../Controllers/Subjects.Controller.js'

import {jwtverify} from '../Middlewares/auth.middleware.js'


const router = Router();

router.route('/add-class').post(addClass);
router.route('/update-class').put(jwtverify,updateClass);
router.route('/getsubject').post(jwtverify,getsubject);

export default router;