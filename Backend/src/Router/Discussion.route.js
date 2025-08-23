import { Router } from "express";
import { jwtverify } from "../Middlewares/auth.middleware.js";
import { getHistory } from "../Controllers/Discussion.controller.js";


const router = Router();
router.post("/history", jwtverify, getHistory);

export default router;
 