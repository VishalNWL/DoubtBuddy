import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/Apierrors.js";
import { User } from "../Models/user.model.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { Apiresponse } from "../Utils/Apiresponse.js";
import jwt from "jsonwebtoken"; // Needed for refresh token verify

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
  getUserById
};
