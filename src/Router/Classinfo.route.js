import { Router} from "express";
import {
    addClass,
    updateClass
}   from '../Controllers/Subjects.Controller.js'

import {jwtverify} from '../Middlewares/auth.middleware.js'


const router = Router();

router.route('/add-class').post(jwtverify,addClass);
router.route('/update-class').patch(jwtverify,updateClass);

export default router;