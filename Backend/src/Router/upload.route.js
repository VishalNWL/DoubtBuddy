import { Router } from "express";
import {jwtverify} from '../Middlewares/auth.middleware.js'
import uploadImageController from "../Controllers/uploadimage.controller.js";
import { uploadFile, getUploadsForStudent, getUploadsForBatch, deleteUpload } from "../Controllers/Upload.controller.js";
import {upload} from '../Middlewares/multer.middleware.js'

const uploadRouter = Router();

uploadRouter.post("/upload",jwtverify,upload.single("image"),uploadImageController)

uploadRouter.post("/file", jwtverify, upload.single("file"), uploadFile);
uploadRouter.get("/student/:studentId", jwtverify, getUploadsForStudent);
uploadRouter.get("/batch/:class/:batch", jwtverify, getUploadsForBatch);
uploadRouter.delete("/:uploadId", jwtverify, deleteUpload);

export default uploadRouter