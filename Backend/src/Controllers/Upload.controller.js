import { ApiError } from "../Utils/Apierrors.js";
import { Apiresponse } from "../Utils/Apiresponse.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { Upload } from "../Models/Upload.model.js";
import { User } from "../Models/user.model.js";
import { deleteFromCloudinary } from "../Utils/DeleteCloudinary.js";

const uploadFile = async (req, res) => {
  try {
    const { class: classNum, batch, type, studentId } = req.body;
    const uploaderId = req.user._id;

    if (!classNum || !batch || !type) {
      return res.status(400).json(new Apiresponse(400, {}, "Provide class, batch, and type"));
    }

    if (type === 'individual' && !studentId) {
      return res.status(400).json(new Apiresponse(400, {}, "Provide studentId for individual upload"));
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json(new Apiresponse(400, {}, "No file provided"));
    }

    const fileUrl = await uploadOnCloudinary(file);
    if (!fileUrl) {
      return res.status(500).json(new Apiresponse(500, {}, "File upload failed"));
    }

    const upload = new Upload({
      uploader: uploaderId,
      student: type === 'individual' ? studentId : null,
      class: classNum,
      batch,
      fileUrl,
      fileName: file.originalname,
      fileType: file.mimetype.split('/')[1],
      type
    });

    await upload.save();

    res.status(200).json(new Apiresponse(200, upload, "File uploaded successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something went wrong");
  }
};

const getUploadsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const uploaderId = req.user._id;

    const uploads = await Upload.find({
      uploader: uploaderId,
      student: studentId,
      type: 'individual'
    }).sort({ createdAt: -1 });

    res.status(200).json(new Apiresponse(200, uploads, "Uploads fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something went wrong");
  }
};

const getUploadsForBatch = async (req, res) => {
  try {
    const { class: classNum, batch } = req.params;
    const uploaderId = req.user._id;

    const uploads = await Upload.find({
      uploader: uploaderId,
      class: classNum,
      batch,
      type: 'batch'
    }).sort({ createdAt: -1 });

    res.status(200).json(new Apiresponse(200, uploads, "Batch uploads fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something went wrong");
  }
};

const deleteUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user._id;

    const upload = await Upload.findById(uploadId);
    if (!upload) {
      return res.status(404).json(new Apiresponse(404, {}, "Upload not found"));
    }

    // Allow if uploader is the user, or if it's individual upload and student is the user
    const canDelete = upload.uploader.toString() === userId.toString() ||
                      (upload.type === 'individual' && upload.student && upload.student.toString() === userId.toString());

    if (!canDelete) {
      return res.status(403).json(new Apiresponse(403, {}, "Not authorized to delete this upload"));
    }

    // Delete from Cloudinary first
    const cloudinaryDeleted = await deleteFromCloudinary(upload.fileUrl);
    if (!cloudinaryDeleted) {
      console.warn(`Failed to delete from Cloudinary: ${upload.fileUrl}`);
      // Continue with database deletion even if Cloudinary fails
    }

    await Upload.findByIdAndDelete(uploadId);

    res.status(200).json(new Apiresponse(200, {}, "Upload deleted successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something went wrong");
  }
};;

export { uploadFile, getUploadsForStudent, getUploadsForBatch, deleteUpload };