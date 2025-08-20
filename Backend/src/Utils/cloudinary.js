import { v2 as cloudinary } from "cloudinary";


// const uploadOnCloudinary = async (image)=>{
//     const buffer = image?.buffer || Buffer.from(await image.arrayBuffer());

//   return new Promise((resolve) => {
//     cloudinary.uploader.upload_stream((error, uploadResult) => {
//         return resolve(uploadResult);
//     }).end(buffer);
// }).then((uploadResult) => {
//     return uploadResult.secure_url ;
// });

// }

 const uploadOnCloudinary = async (image) => {
   
  if (!image || !image.buffer) {
    throw new Error("No image buffer found");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "uploads" }, // optional
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(image.buffer); // multer already provides Buffer
  });
};

export {uploadOnCloudinary}