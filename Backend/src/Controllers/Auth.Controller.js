import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/Apierrors.js";
import { User } from "../Models/user.model.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { Apiresponse } from "../Utils/Apiresponse.js";
import jwt from "jsonwebtoken"; // Needed for refresh token verify
import School from '../Models/School.model.js'

// Registering students and teachers from admin panel
const RegisterUser = asyncHandler(async (req, res) => {
  try {
    let {
      username,
      fullname,
      email,
      password,
      role,
      school,
      class : classval,
      batch,
      teacherClasses
    } = req.body;

    if (!username || !fullname || !email || !role || !password) {
      return res.status(400).json(new Apiresponse(400, {}, "Required fields missing"));
    }
    role = role.toLowerCase()
    let userData = {
      username,
      fullname,
      email,
      role,
      password
    };

     if ((role==='student' || role==='teacher') && school) {
      const existingSchool = await School.findOne({ schoolId: school, status: "active" });
      if (!existingSchool) {
        return res.status(400).json(
          new Apiresponse(400, {}, "Invalid or inactive School ID")
        );
      }
    }


    if (role === "student") {
      if (!classval) {
        return res.status(400).json(new Apiresponse(400, {}, "Class is required for students"));
      }
      userData.class = classval;
      userData.batch = batch || 'A';
      userData.school = school;
    }

    if (role === "teacher") {
    

      if (!teacherClasses || !Array.isArray(teacherClasses)) {
        return res.status(400).json(new Apiresponse(400, {}, "teacherClasses must be an array for teachers"));
      }
       userData.teacherClasses = teacherClasses;
      //  console.log(teacherClasses)
      userData.school = school;
    }

    const user = await User.create(userData);

    return res.status(201).json(new Apiresponse(201, user, "User created successfully"));
  } catch (error) {
    console.error("Register error:", error);
    throw new ApiError(500, "There is an error while registering the user: " + error.message);
  }
});
 
const getcurrentuser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json(new Apiresponse(400, {}, "User not logged in"));
  }

  const userdata = await User.findById(user._id);
  if (!userdata) {
    return res.status(400).json(new Apiresponse(400, {}, "User not found"));
  }

  if(userdata.status!='active'){
    return res.status(400).json(new Apiresponse(400,{},"User Not Verified by the higher authority"))
  }

  return res.status(200).json(new Apiresponse(200, userdata, "Current user fetched successfully"));
});

//getting user by Id
const getUserById=asyncHandler(async(req,res)=>{
  try {
    const {ID} = req.body;

    const userDetail = await User.findById(ID);

    return res.status(200).json(new Apiresponse(200,userDetail,"User Details fetched successfully"));

  } catch (error) {
    throw new ApiError(500,"Something went wrong")
  }
})

const generateAccessTokenAndRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAcessToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Error generating access and refresh token");
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json(new Apiresponse(400, {}, "All fields are required"));
  }

  const user = await User.findOne({ email, username });
  if (!user) {
    return res.status(400).json(new Apiresponse(400, {}, "User not found"));
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return res.status(400).json(new Apiresponse(400, {}, "Password is not correct"));
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
  const userLoggedIn = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new Apiresponse(200, {
      user: userLoggedIn,
      accessToken,
      refreshToken
    }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshToken: "", accessToken: "" }
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresponse(200, {}, "Logged out successfully"));
});

const refreshAccesstoken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(400).json(new Apiresponse(400, {}, "Unauthorized request"));
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);

    if (!user) {
      return res.status(400).json(new Apiresponse(400, {}, "Invalid refresh token"));
    }

    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(400).json(new Apiresponse(400, {}, "Refresh token is expired or reused"));
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true
    };

    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new Apiresponse(200, { accessToken, refreshToken }, "New tokens generated"));
  } catch (error) {
    throw new ApiError(400, "Token refresh failed: " + error.message);
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    return res.status(400).json(new Apiresponse(400, {}, "Old password is incorrect"));
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new Apiresponse(200, {}, "Password updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const {avatar} = req.body;

   console.log("this is avatar",avatar)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: avatar } },
    { new: true }
  ).select("-password");

  return res.status(200).json(new Apiresponse(200, user, "Avatar updated successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).json(new Apiresponse(400, {}, "User not found"));
  }

  user.username = req.body.username ?? user.username;
  user.fullname = req.body.fullname ?? user.fullname;
  user.email = req.body.email ?? user.email;
  user.school = req.body.school ?? user.school;

  if (user.role === "student") {
    user.class = req.body.Class ?? user.class;
    user.batch = req.body.batch ?? user.batch;
  }

  if (user.role === "teacher") {
    user.teacherClasses = req.body.teacherClasses ?? user.teacherClasses;
  }

  await user.save();
  return res.status(200).json(new Apiresponse(200, user, "User updated successfully"));
});

const updateCoverimg = () => {
  console.log("hello");
};

const gettingPendingUser = async(req,res)=>{
   try {
    const userId = req.user;
    const  user = await User.findById(userId);

    if(!user){
       return res.status(400).json(new Apiresponse(500,{},"You are not allowed to fetch data" ))
    }
    if(user.role!=='admin'){
       return res.status(400).json(new Apiresponse(500,{},"You are not allowed to fetch data" ))
    }
    
    const allPendingUser = await User.find({status:"pending"});
    
    return res.status(200).json(new Apiresponse(200,allPendingUser,"All pending user fetched successfully"));
    
  } catch (error) {
    console.log(error);
    return res.status(500).json(new Apiresponse(500,{},'Something went wrong'))
  }
}

const changestatus = async(req,res)=>{
  try {
    const userId = req.user;
    const  user = await User.findById(userId);
    
    if(!user){
       return res.status(400).json(new Apiresponse(500,{},"You are not allowed to fetch data" ))
    }
    if(user.role!=='admin'){
       return res.status(400).json(new Apiresponse(500,{},"You are not allowed to fetch data" ))
    }
    
    const {Id , status} = req.body;
    let pendinguser;

    if(status==='rejected'){

       pendinguser = await User.findByIdAndDelete(Id);
    }
    else{
      
       pendinguser = await User.findByIdAndUpdate(Id,{status:status},{new:true});
       if(!pendinguser){
         return res.status(400).json(new Apiresponse(500,{},"User are not found" ))
   
       }
    }



    return res.status(200).json(new Apiresponse(200, pendinguser,"User status changed successfully"))


  } catch (error) {
    console.log(error);    
    return res.status(500).json(new Apiresponse(500,{},'Something went wrong'))
  }
}

const registerSchool = async(req,res)=>{
 try {
    let {
      schoolName,
      address,
      pincode,
      location,
      contact:contactNo,
      country,
      schoolId,
    } = req.body;

    // ✅ Required fields check
    if (!schoolName || !address || !pincode || !location || !contactNo || !country || !schoolId) {
      return res
        .status(400)
        .json(new Apiresponse(400, {}, "Required fields missing"));
    }

    // ✅ Validate schoolId format (no spaces)
    if (/\s/.test(schoolId)) {
      return res
        .status(400)
        .json(new Apiresponse(400, {}, "School ID cannot contain spaces"));
    }

    // ✅ Check if schoolId already exists
    const existingSchool = await School.findOne({ schoolId });
    if (existingSchool) {
      return res
        .status(409)
        .json(new Apiresponse(409, {}, "School ID already exists"));
    }

    // ✅ Prepare data
    let schoolData = {
      schoolName,
      address,
      pincode,
      location,
      contactNo,
      country,
      schoolId,
      status: "pending", // default
    };

    // ✅ Save to DB
    const school = await School.create(schoolData);

    return res
      .status(201)
      .json(new Apiresponse(201, school, "School registration requested successfully"));
  } catch (error) {
    console.error("School Register error:", error);
    throw new ApiError(
      500,
      "There was an error while registering the school: " + error.message
    );
  }
}

const gettingPendingSchool = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json(new Apiresponse(500, {}, "You are not allowed to fetch data"));
    }
    if (user.role !== "admin") {
      return res
        .status(400)
        .json(new Apiresponse(500, {}, "You are not allowed to fetch data"));
    }

    const allPendingSchool = await School.find({ status: "pending" });

    return res.status(200).json(
      new Apiresponse(
        200,
        allPendingSchool,
        "All pending schools fetched successfully"
      )
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new Apiresponse(500, {}, "Something went wrong"));
  }
};


const changeSchoolStatus = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .json(new Apiresponse(500, {}, "You are not allowed to fetch data"));
    }
    if (user.role !== "admin") {
      return res
        .status(400)
        .json(new Apiresponse(500, {}, "You are not allowed to fetch data"));
    }

    const { Id, status } = req.body;
    let pendingschool;

    if (status === "rejected") {
      pendingschool = await School.findByIdAndDelete(Id);
    } else {
      pendingschool = await School.findByIdAndUpdate(
        Id,
        { status: status },
        { new: true }
      );

      if (!pendingschool) {
        return res
          .status(400)
          .json(new Apiresponse(500, {}, "School not found"));
      }
    }

    return res
      .status(200)
      .json(
        new Apiresponse(200, pendingschool, "School status changed successfully")
      );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new Apiresponse(500, {}, "Something went wrong"));
  }
};

export {
  RegisterUser,
  getcurrentuser,
  updateUser,
  updateCoverimg,
  updateAvatar,
  changePassword,
  refreshAccesstoken,
  logoutUser,
  loginUser,
  getUserById,
  gettingPendingUser,
  changestatus,
  registerSchool,
  changeSchoolStatus,
  gettingPendingSchool
};
