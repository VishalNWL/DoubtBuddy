import { Router } from "express";
import {jwtverify} from '../Middlewares/auth.middleware.js'
import uploadImageController from "../Controllers/uploadimage.controller.js";
import {upload} from '../Middlewares/multer.middleware.js'

const uploadRouter = Router();

uploadRouter.post("/upload",jwtverify,upload.single("image"),uploadImageController)
export default uploadRouter