import { ApiError } from "../Utils/Apierrors.js"
import { Apiresponse } from "../Utils/Apiresponse.js";
import {uploadOnCloudinary} from "../Utils/cloudinary.js";

const uploadImageController = async(req,res)=>{
    try {
        const file = req.file
        console.log("this is file",file)
                const imageurl = await uploadOnCloudinary(file);
 
        if(!imageurl){
            
            res.status(500).json(500,"Not Uploaded")
        }


        res.status(200).json(new Apiresponse(200,imageurl,"Image uploaded successfully"))
    } catch (error) {
        console.log(error)
        throw new ApiError(500,"Something went wrong")
    }
}

export default uploadImageController 