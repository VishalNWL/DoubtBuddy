import { v2 as cloudinary } from "cloudinary";


const uploadOnCloudinary=async (localfilePath)=>{
    try {
        if(!localfilePath) return null;

        //upload file to  cloudinary
        const response=await cloudinary.uploader.upload(localfilePath,{
            resource_type:"auto"
        }) 

        //file uploaded successfully
        console.log("File is uploaded on cloudinary",response.url);
        return response;
        
    } catch (error) {
        console.error("Cloudinary Upload error");
        console.log(error);
        // fs.unlinkSync(localfilePath);//removing file from the local storage as it is malicious
        return null;
    }
}

export {uploadOnCloudinary}