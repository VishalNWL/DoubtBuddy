import { Router} from "express";
import {
  healthcheck
}   from '../Controllers/healthcheck.Controller.js'

import {jwtverify} from '../Middlewares/auth.middleware.js'


const router =Router();

router.route('/health-check').get(healthcheck);

export default healthcheck;