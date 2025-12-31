import { ClassInfo } from "../Models/ClassInfo.model.js";
import School from "../Models/School.model.js";
import { User } from "../Models/user.model.js";
import { Apiresponse } from "../Utils/Apiresponse.js";

const getStudentsByClass = async (req,res)=>{
    try {
      const schoolId= req.school;
      if(!schoolId){
         return res.status(400).json(new Apiresponse(400,{},"Unauthorized request"));
      }
      
      const school = await School.findById(schoolId);

      if(!school){
        return res.status(400).json(new Apiresponse(400,{},"School not found"));
      }

      const {Class} = req.body;
      
      const students = await User.find({school:school.schoolId , class:Class ,role:'student' , status:'active'})
      .select("-password -role -teacherClasses -forget_password_expiry -forget_password_otp -answeredQuestions -updatedAt")
      .sort({batch:1 , fullname:1})

      return res.status(200).json(new Apiresponse(200,students,"Students fetched successfully"));
        
    } catch (error) {
        console.log("Something went wrong",error);
        return res.status(500).json(new Apiresponse(500,{},"Something went wrong"));
    }
}
const getTeachersByClass = async (req,res)=>{
    try {
      const schoolId= req.school;
      if(!schoolId){
         return res.status(400).json(new Apiresponse(400,{},"Unauthorized request"));
      }
      
      const school = await School.findById(schoolId);

      if(!school){
        return res.status(400).json(new Apiresponse(400,{},"School not found"));
      }

      const {Class} = req.body;
      
      const teachers = await User.find(
        {school:school.schoolId ,
           role:'teacher',
           "teacherClasses.class":Class,
            status:'active'
           }
      ).select("-password -role -teacherClasses -forget_password_expiry -forget_password_otp -answeredQuestions -updatedAt")
      

      return res.status(200).json(new Apiresponse(200,teachers,"Teachers fetched successfully"));
        
    } catch (error) {
        console.log("Something went wrong",error);
        return res.status(500).json(new Apiresponse(500,{},"Something went wrong"));
    }
}


const getUserProfileForSchool = async (req, res) => {
  try {
    const schoolId = req.school; // attached by auth middleware
    const { userId } = req.params;

    if (!schoolId) {
      return res.status(400).json(new Apiresponse(400, {}, "Unauthorized request"));
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json(new Apiresponse(404, {}, "School not found"));
    }

    const user = await User.findOne({
      _id: userId,
      school: school.schoolId,
    })
      .select("-password -forget_password_otp -forget_password_expiry -updatedAt");

    if (!user) {
      return res.status(404).json(new Apiresponse(404, {}, "User not found"));
    }

    // Populate depending on role
    if (user.role === "student") {
      await user.populate("AskedQuestions", "title description createdAt");
    }
    if (user.role === "teacher") {
      await user.populate("answeredQuestions", "title description createdAt");
    }

    return res
      .status(200)
      .json(new Apiresponse(200, user, "User profile fetched successfully"));
  } catch (error) {
    console.error("Error fetching user profile", error);
    return res
      .status(500)
      .json(new Apiresponse(500, {}, "Something went wrong"));
  }
};


const getSchoolDetailByUniqueId = async(req,res)=>{
  const {schoolId} = req.body;

  if(!schoolId){
      return res.status(400).json(new Apiresponse(400,{},"Provide school Id"));
   }

   try {

     const school = await School.findOne({schoolId:schoolId}).select("classes OptionalSubjects");

     if(!school){
        return res.status(400).json(new Apiresponse(400,{},"No school found"));
     }

     const schoolTrimmed = schoolId.trim();

     const coreSubject = await ClassInfo.find(
    { school:schoolTrimmed },
    { class:1, stream:1,subjects:1, _id:0 }
  ).sort({ class:1 });



     return res.status(200).json(new Apiresponse(200,{coreSubject,school},"School data fetched successfully"));
    
   } catch (error) {
      console.log(error?.message);
      console.log(error);
      return res.status(400).json(new Apiresponse(500,{},"Something went wrong"));
   }
}


export {
    getStudentsByClass,
    getTeachersByClass,
    getUserProfileForSchool,
    getSchoolDetailByUniqueId
}