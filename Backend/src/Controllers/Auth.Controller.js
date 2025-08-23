import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/Apierrors.js";
import { User } from "../Models/user.model.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { Apiresponse } from "../Utils/Apiresponse.js";
import jwt from "jsonwebtoken"; // Needed for refresh token verify
import School from '../Models/School.model.js'
import { Doubt } from "../Models/Doubts.model.js";

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
 
const getCurrentAccount = asyncHandler(async (req, res) => {
  const account = req.user || req.school; 
  // 👆 assuming your auth middleware attaches either `req.user` or `req.school`

  if (!account) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "Not logged in"));
  }

  let data;

  if (account.role) {
    // 👇 this means it's a USER (student/teacher)
    data = await User.findById(account._id).select("-password -refreshToken");

    if (!data) {
      return res
        .status(404)
        .json(new Apiresponse(404, {}, "User not found"));
    }

    if (data.status !== "active") {
      return res
        .status(403)
        .json(
          new Apiresponse(
            403,
            {},
            "User Not Verified by the higher authority"
          )
        );
    }

    return res
      .status(200)
      .json(new Apiresponse(200, data, "Current user fetched successfully"));
  } else {
    // 👇 otherwise treat as SCHOOL account
    data = await School.findById(account._id).select("-password -refreshToken");

    if (!data) {
      return res
        .status(404)
        .json(new Apiresponse(404, {}, "School not found"));
    }

    if (data.status !== "active") {
      return res
        .status(403)
        .json(
          new Apiresponse(
            403,
            {},
            "School not verified by higher authority"
          )
        );
    }

    return res
      .status(200)
      .json(new Apiresponse(200, data, "Current school fetched successfully"));
  }
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
const generateAccessTokenAndRefreshToken = async (id, type = "user") => {
  try {
    let entity;

    if (type === "user") {
      entity = await User.findById(id);
    } else if (type === "school") {
      entity = await School.findById(id);
    }

    if (!entity) {
      throw new ApiError(404, `${type} not found`);
    }

    // Generate tokens
    const accessToken = entity.generateAccessToken();
    const refreshToken = entity.generateRefreshToken();

    // Save refreshToken in DB
    entity.refreshToken = refreshToken;
    await entity.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      `Error generating access and refresh token for ${type}`
    );
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
    return res.status(400).json(new Apiresponse(400, {}, "Incorrect Password"));
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id,"user");
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
   let model;
  let entity;

  // 🔹 Check if it's a user or school
  if (req.user) {
    model = User;
    entity = req.user;
  } else if (req.school) {
    model = School;
    entity = req.school;
  } else {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "No user or school found in request"));
  }

  // 🔹 Clear tokens in DB
  await model.findByIdAndUpdate(entity._id, {
    $set: { refreshToken: "", accessToken: "" },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  // 🔹 Clear cookies
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new Apiresponse(
        200,
        {},
        `${req.user ? "User" : "School"} logged out successfully`
      )
    );
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

const registerSchool = async (req, res) => {
  try {
    let {
      schoolName,
      address,
      pincode,
      location,
      contact: contactNo,
      country,
      schoolId,
      password,
    } = req.body;

    // ✅ Required fields check
    if (
      !schoolName ||
      !address ||
      !pincode ||
      !location ||
      !contactNo ||
      !country ||
      !schoolId ||
      !password
    ) {
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
      password, // will be hashed automatically in pre-save hook
      status: "pending", // default
    };

    // ✅ Save to DB
    const school = await School.create(schoolData);

    return res
      .status(201)
      .json(
        new Apiresponse(
          201,
          {
            _id: school._id,
            schoolName: school.schoolName,
            schoolId: school.schoolId,
            status: school.status,
            createdAt: school.createdAt,
          },
          "School registration requested successfully"
        )
      );
  } catch (error) {
    console.error("School Register error:", error);
    throw new ApiError(
      500,
      "There was an error while registering the school: " + error.message
    );
  }
};

const getCurrentSchool = asyncHandler(async (req, res) => {
  const school = req.school; // this comes from middleware after verifying token
  if (!school) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "School not logged in"));
  }

  const schoolData = await School.findById(school._id);
  if (!schoolData) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "School not found"));
  }

  if (schoolData.status !== "active") {
    return res
      .status(400)
      .json(
        new Apiresponse(
          400,
          {},
          "School not verified by the higher authority"
        )
      );
  }

  return res
    .status(200)
    .json(
      new Apiresponse(
        200,
        schoolData,
        "Current school fetched successfully"
      )
    );
});

const loginSchool = asyncHandler(async (req, res) => {
  const { schoolId, password } = req.body;

  // ✅ Check required fields
  if (!schoolId || !password) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "School ID and password are required"));
  }

  // ✅ Find school by schoolId
  const school = await School.findOne({ schoolId });
  if (!school) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "School not found"));
  }

  // ✅ Verify password
  const isPasswordValid = await school.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "Password is not correct"));
  }

  // ✅ Check if school is active
  if (school.status !== "active") {
    return res
      .status(403)
      .json(
        new Apiresponse(
          403,
          {},
          "School not verified by the higher authority"
        )
      );
  }

  // ✅ Generate tokens
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(school._id, "school"); 
  // pass type=school so tokens don’t mix with users

  // ✅ Remove sensitive fields
  const schoolLoggedIn = await School.findById(school._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // ✅ Send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new Apiresponse(
        200,
        {
          school: schoolLoggedIn,
          accessToken,
          refreshToken,
        },
        "School logged in successfully"
      )
    );
});

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

const getStudentStats = asyncHandler(async (req, res) => {
  try {
    const studentId = req.params.id;

    const doubts = await Doubt.find({ askedBy: studentId });

    const totalDoubts = doubts.length;
    const answered = doubts.filter((d) => d.status === "answered").length;
    const pendingDoubts = totalDoubts - answered;

    const accuracy = totalDoubts > 0 ? Math.round((answered / totalDoubts) * 100) : 0;

    // Group total doubts by subject
    const doubtsBySubject = doubts.reduce((acc, d) => {
      if (!acc[d.subject]) acc[d.subject] = 0;
      acc[d.subject]++;
      return acc;
    }, {});

    // Group pending doubts by subject
    const pendingBySubject = doubts.reduce((acc, d) => {
      if (d.status !== "answered") {
        if (!acc[d.subject]) acc[d.subject] = 0;
        acc[d.subject]++;
      }
      return acc;
    }, {});

    const subjectData = Object.keys(doubtsBySubject).map((sub) => ({
      subject: sub,
      total: doubtsBySubject[sub],
      pending: pendingBySubject[sub] || 0, // include pending counts
    }));

    return res.json(
      new Apiresponse(
        200,
        {
          totalDoubts,
          answeredDoubts: answered,
          pendingDoubts,
          accuracy,
          doubtsBySubject: subjectData, // now has total + pending
        },
        "Student stats fetched successfully"
      )
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(new Apiresponse(500, {}, "Error fetching student stats"));
  }
});



/**
 * Teacher Stats
 * - total doubts answered
 * - pending doubts in the system (unanswered)
 * - accuracy (optional → correctness, but here just answered % of system doubts)
 * - answered grouped by subject
 */
const getTeacherStats = asyncHandler(async (req, res) => {
  try {
    const teacherId = req.params.id;

    const answeredDoubts = await Doubt.find({ answeredBy: teacherId });
    const totalAnswered = answeredDoubts.length;

    const totalUnanswered = await Doubt.countDocuments({ status: "unanswered" });
    const unansweredDoubts = await Doubt.find({ status: "unanswered" });

    // Group answered by subject
    const answeredBySubject = answeredDoubts.reduce((acc, d) => {
      if (!acc[d.subject]) acc[d.subject] = 0;
      acc[d.subject]++;
      return acc;
    }, {});

    // Group pending (unanswered) by subject
    const pendingBySubject = unansweredDoubts.reduce((acc, d) => {
      if (!acc[d.subject]) acc[d.subject] = 0;
      acc[d.subject]++;
      return acc;
    }, {});

    const answeredSubjectData = Object.keys(answeredBySubject).map((sub) => ({
      subject: sub,
      answered: answeredBySubject[sub],
    }));

    const pendingSubjectData = Object.keys(pendingBySubject).map((sub) => ({
      subject: sub,
      pending: pendingBySubject[sub],
    }));

    return res.json(
      new Apiresponse(
        200,
        {
          totalAnswered,
          totalUnanswered,
          answeredBySubject: answeredSubjectData,
          pendingBySubject: pendingSubjectData,
        },
        "Teacher stats fetched successfully"
      )
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(new Apiresponse(500, {}, "Error fetching teacher stats"));
  }
});





export {
  RegisterUser,
  getCurrentAccount,
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
  gettingPendingSchool,
  getCurrentSchool,
  loginSchool,
  getStudentStats,
  getTeacherStats
};
