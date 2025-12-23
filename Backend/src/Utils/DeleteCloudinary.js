import { v2 as cloudinary } from "cloudinary";

const getPublicIdFromCloudinaryUrl = (url) => {
  const cleanUrl = url.split("?")[0];              // remove query params
  const afterUpload = cleanUrl.split("/upload/")[1];
  const withoutVersion = afterUpload.replace(/^v\d+\//, "");
  const publicId = withoutVersion.replace(/\.[^/.]+$/, "");
  return publicId;
};


const deleteFromCloudinary= async(url)=>{
    try {
        if(!url){
            return false;
        }

        const publicId = getPublicIdFromCloudinaryUrl(url);
    
       const response= await cloudinary.uploader.destroy(publicId);

       if (response.result === "ok" || response.result === "not found") {
                 return true;
             } else {
              return false;
             }
    
    } catch (error) {
        console.log(error)
        return false;
    }
}

export {deleteFromCloudinary};