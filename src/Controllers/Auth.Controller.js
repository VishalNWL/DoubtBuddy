import {asyncHandler} from "../Utils/asyncHandler.js"
import { ApiError } from "../Utils/Apierrors.js";
import {User} from "../Models/user.model.js"
import {uploadOnCloudinary} from "../Utils/cloudinary.js"
import { Apiresponse } from "../Utils/Apiresponse.js";
import { jwtverify } from "../Middlewares/auth.middleware.js";

//login
//register
//getcurrentuser
//logout


//Registering students and teachers from admin panel
const RegisterUser=asyncHandler(async(req,res)=>{
    try {
  const {
    username,
    fullname,
    email,
    password,
    role,
    school,
    Class, // For students
    teacherClasses // For teachers
  } = req.body;

  if (!username || !fullname || !email || !role || !school || !password) {
    throw new ApiError(400, "Required fields missing");
  }

  const avatarPath=req.files.avatarimg[0]?.path;
  
  if(!avatarPath){
    throw new ApiError(400,"Avatar is required");
  }

  const avatarURL=await uploadOnCloudinary(avatarPath);
  if(!avatarURL){
    throw new ApiError(500,"Some error occured while uploading on cloudinary");
  }


  let userData = {
    username,
    fullname,
    email,
    role,
    password,
    school,
    avatarURL
  };

  if (role === "student") {
    if (!Class) {
      throw new ApiError(400, "Class is required for students");
    }
    userData.class = Class;
  }

  if (role === "teacher") {
    if (!teacherClasses || !Array.isArray(teacherClasses)) {
      throw new ApiError(400, "teacherClasses must be an array for teachers");
    }
    userData.teacherClasses = teacherClasses;
  }

  const user = await User.create(userData);

  res.status(201).json(new Apiresponse(201, user, "User created successfully"));
}

     catch (error) {
        throw new ApiError(500,"There is an error while registering the user");
    }
})

//Register admin:
const Registeradmin=asyncHandler(async(req,res)=>{
       try {
  const {
    username,
    fullname,
    email,
    role,
    password
  } = req.body;

  if (!username || !fullname || !email || !role || !school || !password) {
    throw new ApiError(400, "Required fields missing");
  }

  let userData = {
    username,
    fullname,
    email,
    role,
    password
  };

  const user = await User.create(userData);

  res.status(201).json(new Apiresponse(201, user, "Admin Registered successfully"));
}

     catch (error) {
        throw new ApiError(500,"There is an error while registering the Admin");
    }
})


//Getting current user
const getcurrentuser=asyncHandler(async(req,res)=>{
    try {
        const user=req.user;
        if(!user){
           throw new ApiError(400,"User not logged in");
        }

        const userdata=await User.findbyId(user._id);

        if(!userdata){
            throw new ApiError(404,"User no found");
        }

        res.status(200)
        .json(new Apiresponse(200,userdata,"Current user fetched successfully"));
        
    } catch (error) {
        throw new ApiError(500,error.message);
    }
})


const generateAccessTokenAndRefreshToken=async (userid)=>{
  try {
    const user= await User.findById(userid);

    const refreshToken=user.generateRefreshToken();
    const accessToken=user.generateAcessToken();
    user.refreshToken=refreshToken;
    user.save({ validateBeforeSave:false});

    return {accessToken,refreshToken};

  } catch (error) {
    console.log(error);
      throw new ApiError(400,"Some error occured while generating accesstoken and accesstoken");
  }
}


// Login user

const loginUser=asyncHandler(async (req,res)=>{
    //req body --password, email,username
    //check username and email
    //find the user
    //check password
    //generate refresh and access token
    //send response

    const {username,email,password}=req.body;

    const user= await User.findOne({
        $or:[{username},{email}]
    })

    if(!username && !email){
        throw new ApiError(400,"user not found");
    }

    const isPasswordvalid=await user.isPasswordCorrect(password);
    
    if(!isPasswordvalid){
        throw new ApiError(400,"Password is not correct");
    }
   
    const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user._id);

    const userloggedin=await User.findById(user._id).select("-password -refreshToken");


    const option={  //this will allow only server to apply crud operation on cookies frontend will only can see them
        httpOnly:true,
        secure:true,
    }

  res.status(200)
  .cookie("accessToken",accessToken,option)
  .cookie("refreshToken",refreshToken,option)
  .json({
     user:userloggedin,accessToken,refreshToken,
     message:"user logged in successfully"
  })
     
})


// logout the user

const logoutUser=asyncHandler(async (req,res)=>{
     await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
     )

     const option={ 
        httpOnly:true,
        secure:true,
    }

    res.status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new Apiresponse(200,{},"Logged out successfully"));
})




const refreshAccesstoken = asyncHandler(async (req,res)=>{
   try {
    const incomingrefreshToken=req.cookies.refreshToken||req.body.refreshToken;

   if(!incomingrefreshToken){
        throw new ApiError(400,"Unauthorized request");
   }

   const decodedToken=jwtverify.verify(incomingrefreshToken,process.env.api_secret);
   const user=await User.findById(decodedToken._id);

   if(!user){
    throw new ApiError(400,"Invalid refresh Token");
   }

   if(incomingrefreshToken!==user?.accessToken){
     throw new ApiError(400,"Refresh Token is expired or used");
   }

    const option={
        httpOnly:true,
        secure:true
    }

  const {accessToken,refreshToken}=  await generateAccessTokenAndRefreshToken(user._id);
    res.status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new Apiresponse(200,{accessToken,refreshToken},"Refresh token generated successfully")
    )
   } catch (error) {
      throw new ApiError(400,"Some error occured");
   }

})

const changePassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;

    const user=await User.findById(req.user?._id);
    const isPasswordCorrect=await user.isPasswordCorrect(newPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400,"Password is not correct");
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    
    res.status(200)
    .json(new Apiresponse(200,{newPassword},"Password updated successfully"));
})

const updateAvatar=asyncHandler(async (req,res)=>{
    const avatarlocalpath=req.files.avatar[0]?.path;
    if(!avatarlocalpath){
        throw new ApiError(400,"avatar is missing");
    }
   
    const avatar=await uploadOnCloudinary(localfilepath);
    if(!avatar.url){
        throw new ApiError(500,"Error while uploading on Cloudinary");
    }

   const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")
  
    res.status(200)
    .json(new Apiresponse(200,{user},"Avatar updated successfully"));
   
})

const updateCoverimg=asyncHandler(async (req,res)=>{
    const Coverimglocalpath=req.files?.Coverimg[0]?.path;
    if(!Coverimglocalpath){
        throw new ApiError(400,"CoverImage is missing");
    }
   
    const Coverimg=await uploadOnCloudinary(Coverimglocalpath);
    if(!Coverimg.url){
        throw new ApiError(500,"Error while uploading on Cloudinary");
    }

   const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:Coverimg.url
            }
        },
        {
            new:true
        }
    ).select("-password")
  
    res.status(200)
    .json(new Apiresponse(200,{user},"CoverImage updated successfully"));
   
})



//updating account detail

const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Only update if fields are provided
  user.username = req.body.username ?? user.username;
  user.fullname = req.body.fullname ?? user.fullname;
  user.email = req.body.email ?? user.email;
  user.school = req.body.school ?? user.school;


  if (user.role === "student") {
    user.class = req.body.Class ?? user.class;
  }

  if (user.role === "teacher") {
    user.teacherClasses = req.body.teacherClasses ?? user.teacherClasses;
  }

  await user.save();

  res.status(200).json(new Apiresponse(200, user, "User updated successfully"));
});




export {
    RegisterUser,
    Registeradmin,
    getcurrentuser,
    updateUser,
    updateCoverimg,
    updateAvatar,
    changePassword,
    refreshAccesstoken,
    logoutUser,
    loginUser
}

