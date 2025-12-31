import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/Apierrors.js";
import { User } from "../Models/user.model.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { Apiresponse } from "../Utils/Apiresponse.js";
import jwt from "jsonwebtoken"; // Needed for refresh token verify
import School from '../Models/School.model.js'
import { Doubt } from "../Models/Doubts.model.js";
import { generateOtp } from "../Utils/OTPGenerator.js";
import { sendOTP } from "../Utils/SendOtp.js";

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
      teacherClasses,
      stream,
      optionalSubject
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
    return res.status(400).json(
      new Apiresponse(400, {}, "Class is required for students")
    );
  }

  const classNum = Number(classval);

  if (Number.isNaN(classNum)) {
    return res.status(400).json(
      new Apiresponse(400, {}, "Class must be a valid number")
    );
  }

  userData.class = classNum;
  userData.batch = (batch || 'A').toUpperCase().trim();
  userData.school = school;

  // Senior classes (11 & 12)
  if (classNum >= 11) {
    userData.stream = stream || null;
    userData.optionalSubject = req.body.optionalSubject || null;
  }
}


  if (role === "teacher") {

  if (!teacherClasses || !Array.isArray(teacherClasses)) {
    return res.status(400).json(
      new Apiresponse(400, {}, "teacherClasses must be an array for teachers")
    );
  }

  if (teacherClasses.length === 0) {
    return res.status(400).json(
      new Apiresponse(400, {}, "At least one class is required")
    );
  }

  for (const t of teacherClasses) {

    if (!t || typeof t.class === "undefined" || !t.batch || !t.subject) {
      return res.status(400).json(
        new Apiresponse(400, {}, "Each teacher class must include class, batch & subject")
      );
    }

    t.class = Number(t.class);
    t.batch = String(t.batch).trim();
    t.subject = String(t.subject).trim();

    if (Number.isNaN(t.class)) {
      return res.status(400).json(
        new Apiresponse(400, {}, "Class must be a valid number")
      );
    }
  }

  userData.teacherClasses = teacherClasses;
  userData.school = school;
}

    
    const user = await User.create(userData);
    
    return res.status(201).json(new Apiresponse(201, user, "User created successfully"));
  } catch (error) {
    if(error.code ===11000){
    return res.status(500).json(new Apiresponse(500, {},'Username already taken'));
  }
  else{
    return res.status(500).json(new Apiresponse(500, {},'Something went wrong'));
    
    }
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

const gettingPendingStudent=async(req,res)=>{
   try {
    const userId = req.user;
    const  user = await User.findById(userId);

    if(!user){
       return res.status(400).json(new Apiresponse(500,{},"You are not allowed to fetch data" ))
    }
    if(user.role!=='teacher'){
       return res.status(400).json(new Apiresponse(500,{},"You are not allowed to fetch data" ))
    }


const teacherClasses = user.teacherClasses; // teacher's classes

const allPendingStudents = await User.find({
  status: "pending",
 $or: teacherClasses.map(tc => ({
    class: tc.class,
    batch: tc.batch
  }))
});

    
    return res.status(200).json(new Apiresponse(200,allPendingStudents,"All pending user fetched successfully"));
    
  } catch (error) {
    console.log(error);
    return res.status(500).json(new Apiresponse(500,{},'Something went wrong'))
  }
}
const gettingPendingTeacher=async(req,res)=>{
   try {
    let schoolId = req.school.schoolId;
    
     if(!schoolId){
        return res.status(400).json(new Apiresponse(400,{},"Provide the schoolId"))
     }
    const  school = await School.findOne({schoolId});

    if(!school){
       return res.status(400).json(new Apiresponse(500,{},"You are not allowed to fetch data" ))
    }
     
    const allPendingUser = await User.find({status:"pending" ,role:'teacher',school:schoolId});
    
    return res.status(200).json(new Apiresponse(200,allPendingUser,"All pending user fetched successfully"));
    
  } catch (error) {
    console.log(error);
    return res.status(500).json(new Apiresponse(500,{},'Something went wrong'))
  }
}

const changestatus = async(req,res)=>{
  try {
    const userId = req.user;
    const schoolId= req.school;

    let  user = await User.findById(userId);

    if(!user){
      user = await School.findById(schoolId);
    }
  
    
    if(!user){
       return res.status(400).json(new Apiresponse(400,{},"You are not allowed to fetch data" ))
    }
    if(user.role==='student'){
       return res.status(400).json(new Apiresponse(400,{},"You are not allowed to change status" ))
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
      email,
      OptionalSubjects,
      classes
    } = req.body;


    // ---------- REQUIRED VALIDATION ----------
    if (
      !schoolName ||
      !address ||
      !pincode ||
      !location ||
      !contactNo ||
      !country ||
      !schoolId ||
      !password ||
      !email ||
      !classes
    ) {
      return res
        .status(400)
        .json(new Apiresponse(400, {}, "Required fields missing"));
    }


    if (/\s/.test(schoolId)) {
      return res
        .status(400)
        .json(new Apiresponse(400, {}, "School ID cannot contain spaces"));
    }


    const existingSchool = await School.findOne({ schoolId });
    if (existingSchool) {
      return res
        .status(409)
        .json(new Apiresponse(409, {}, "School ID already exists"));
    }



    // ---------- NORMALIZE CLASSES ----------
    const normalizedClasses = (classes || []).map(obj => {

      // CASE 1 — already correct format
      if (typeof obj?.class !== "undefined") {
        const classNum = Number(obj.class);

        if (isNaN(classNum)) throw new Error("Invalid class value received");

        return {
          class: classNum,
          batches: obj.batches || []
        };
      }

      // CASE 2 — legacy format
      const rawKey = Object.keys(obj)[0];
      const classNum = parseInt(rawKey, 10);

      if (isNaN(classNum)) throw new Error("Invalid class value received");

      return {
        class: classNum,
        batches: obj[rawKey] || []
      };
    });



    // ---------- NORMALIZE OPTIONAL SUBJECTS ----------
    const normalizedOptionalSubjects = (OptionalSubjects || []).map(obj => {

      // CASE 1 — already correct schema
      if (obj?.stream) {
        return {
          stream: obj.stream,
          subjects: obj.subjects || []
        };
      }

      // CASE 2 — legacy: { Science:["Math","Bio"] }
      const key = Object.keys(obj)[0];

      return {
        stream: key,
        subjects: obj[key] || []
      };
    });



    // ---------- FINAL SCHOOL DATA ----------
    const schoolData = {
      schoolName,
      email,
      address,
      pincode,
      location,
      contactNo,
      country,
      schoolId,
      password,
      status: "pending",
      classes: normalizedClasses,
      OptionalSubjects: normalizedOptionalSubjects
    };


    // ---------- SAVE ----------
    const school = await School.create(schoolData);


    return res.status(201).json(
      new Apiresponse(
        201,
        {
          _id: school._id,
          schoolName: school.schoolName,
          schoolId: school.schoolId,
          status: school.status,
          createdAt: school.createdAt
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


const updateSchool = async (req, res) => {
  try {
    const userId = req.school;

    if (!userId) {
      return res
        .status(401)
        .json(new Apiresponse(401, {}, "Unauthorized request"));
    }

    const {
      address,
      classes,
      contactNo,
      country,
      pincode,
      location,
      schoolName,
      email,
      password,
      OptionalSubjects
    } = req.body;


    // ---------- BASIC FIELD CHECK ----------
    if (
      !address ||
      !Array.isArray(classes) ||
      !contactNo ||
      !country ||
      !pincode ||
      !location ||
      !schoolName ||
      !email
    ) {
      return res
        .status(400)
        .json(new Apiresponse(400, {}, "All fields required"));
    }


    // ---------- VALIDATE CLASSES ----------
    for (const item of classes) {

      if (
        typeof item.class !== "number" ||
        !Array.isArray(item.batches)
      ) {
        return res
          .status(400)
          .json(new Apiresponse(400, {}, "Invalid class structure"));
      }
    }


    // ---------- VALIDATE OPTIONAL SUBJECTS ----------
    if (OptionalSubjects && !Array.isArray(OptionalSubjects)) {
      return res
        .status(400)
        .json(new Apiresponse(400, {}, "Invalid OptionalSubjects format"));
    }


    const school = await School.findById(userId);

    if (!school) {
      return res
        .status(404)
        .json(new Apiresponse(404, {}, "School not found"));
    }


    // ---------- UPDATE FIELDS ----------
    school.address = address;
    school.classes = classes; // <-- structured array
    school.OptionalSubjects = OptionalSubjects || [];
    school.contactNo = contactNo;
    school.country = country;
    school.pincode = pincode;
    school.location = location;
    school.schoolName = schoolName;
    school.email = email;

    // ---------- PASSWORD (ONLY IF PROVIDED) ----------
    if (password && password.trim() !== "") {
      school.password = password;
    }

    await school.save();


    return res
      .status(200)
      .json(new Apiresponse(200, { school }, "School updated successfully"));


  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new Apiresponse(500, {}, "Something went wrong"));
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
  const teacherId = req.params.id;

try {
  const teacher = await User.findById(teacherId);

  if (!teacher) {
    return res
      .status(400)
      .json(new Apiresponse(400, {}, "Teacher not found"));
  }

  // Build an array of filter conditions from teacherClasses
  const teacherClasses = teacher.teacherClasses || [];
  if (teacherClasses.length === 0) {
    return res.json(
      new Apiresponse(
        200,
        { totalAnswered: 0, totalUnanswered: 0, answeredBySubject: [], pendingBySubject: [] },
        "Teacher has no assigned classes"
      )
    );
  }

  // Build $or query
  const classFilters = teacherClasses.map((tc) => ({
    class: tc.class,
    subject: tc.subject,
    batch: tc.batch,
  }));

  // Fetch doubts answered by this teacher for their classes
  const answeredDoubts = await Doubt.find({
    answeredBy: teacherId,
    $or: classFilters,
  });

  const totalAnswered = answeredDoubts.length;

  // Fetch unanswered doubts for this teacher's classes
  const unansweredDoubts = await Doubt.find({
    status: "unanswered",
    $or: classFilters,
  });

  const totalUnanswered = unansweredDoubts.length;

  // Group answered by subject
  const answeredBySubject = answeredDoubts.reduce((acc, d) => {
    if (!acc[d.subject]) acc[d.subject] = 0;
    acc[d.subject]++;
    return acc;
  }, {});

  // Group unanswered by subject
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


const getSchoolStats = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const classWise = await Doubt.aggregate([
      { $match: { schoolId } },
      {
        $group: {
          _id: "$class",
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "unanswered"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalDoubts = classWise.reduce((acc, c) => acc + c.total, 0);
    const totalPending = classWise.reduce((acc, c) => acc + c.pending, 0);

    res.json({
      success: true,
      data: {
        totalDoubts,
        totalPending,
        classWise: classWise.map((c) => ({
          class: c._id,
          total: c.total,
          pending: c.pending,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
//Forgot password

const sendOtp = async (req, res) => {
  try {
    const otp = generateOtp();
    const expireTime = new Date(Date.now() + 60 * 60 * 1000);
    const { email, username, schoolId } = req.body;

    if (!email && !username && schoolId === "0") {
      return res.json(new Apiresponse(400, {}, "All fields are required"));
    }

    let user;
    let recipientEmail;
    let recipientName;

    if (schoolId !== "0") {
      user = await School.findOne({ schoolId });
      if (!user) {
        return res.json(new Apiresponse(400, {}, "School user not found"));
      }

      recipientEmail = email || user.email;
      recipientName = user.schoolName || `School-${schoolId}`;

    } else {
      user = await User.findOne({ email, username });
      if (!user) {
        return res.json(new Apiresponse(400, {}, "User not found"));
      }

      recipientEmail = email;
      recipientName = username;
    }

    if (!recipientEmail) {
      return res.json(new Apiresponse(400, {}, "No valid email to send OTP"));
    }

    const otpSent = await sendOTP({ name: recipientName, email: recipientEmail, otp });

    if (otpSent) {
      user.forget_password_otp = otp;
      user.forget_password_expiry = expireTime;
      await user.save();

      return res.json(new Apiresponse(200, { email: recipientEmail }, "Otp sent successfully"));
    }

    return res.json(new Apiresponse(500, {}, "Failed to send OTP"));
  } catch (error) {
    return res.json(new Apiresponse(500, {}, "Something went wrong: " + error.message));
  }
};



const verifyOtp = async (req, res) => {
  try {
    const { email, otp, schoolId, username } = req.body;

    if (!email || !otp) {
      return res.json(new Apiresponse(400, {}, "All fields are required"));
    }

    let user = "";

    // Check if school or user
    if (schoolId !== '0') {
      user = await School.findOne({ schoolId: schoolId });
      if (!user) {
        return res.json(new Apiresponse(400, {}, "School user not found"));
      }
    } else {
      user = await User.findOne({ email: email, username: username });
      if (!user) {
        return res.json(new Apiresponse(400, {}, "User not found"));
      }
    }

    const currentTime = Date.now();

    if (user.forget_password_expiry < currentTime) {
      return res.json(new Apiresponse(400, {}, "Otp expired"));
    }

    if (otp !== user.forget_password_otp) {
      return res.json(new Apiresponse(400, {}, "Otp not matched"));
    }

    // Clear OTP and expiry based on model type
    user.set('forget_password_otp', undefined, { strict: false });
    user.set('forget_password_expiry', undefined, { strict: false });
    await user.save();

    res.status(200).json(new Apiresponse(200, {}, "Otp verified successfully"));

  } catch (error) {
    throw new ApiError(500, "Something went wrong " + error.message);
  }
};



const resetpassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword, username, schoolId } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.json(new Apiresponse(400, {}, "All fields are required"));
    }

    if (newPassword !== confirmPassword) {
      return res.json(new Apiresponse(400, {}, "New password and confirm password are not equal"));
    }

    let user = "";

    if (schoolId !== '0') {
      user = await School.findOne({ schoolId: schoolId });
      if (!user) {
        return res.json(new Apiresponse(400, {}, "School user not found"));
      }
    } else {
      user = await User.findOne({ email: email, username: username });
      if (!user) {
        return res.json(new Apiresponse(400, {}, "User not found"));
      }
    }

    user.set('forget_password_otp', undefined, { strict: false });
    user.set('forget_password_expiry', undefined, { strict: false });
    user.set('password', newPassword, { strict: false });
    await user.save();

    res.status(200).json(new Apiresponse(200, user, "Password updated successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong " + error.message);
  }
};



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
  gettingPendingStudent,
  gettingPendingTeacher,
  changestatus,
  registerSchool,
  updateSchool,
  changeSchoolStatus,
  gettingPendingSchool,
  getCurrentSchool,
  loginSchool,
  getStudentStats,
  getTeacherStats,
  sendOtp,
  verifyOtp,
  resetpassword,
  getSchoolStats
};
