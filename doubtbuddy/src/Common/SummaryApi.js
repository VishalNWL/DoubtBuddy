

export const baseURL = import.meta.env.VITE_BASE_URL

const SummaryAPi = {
    register: {
        url: '/api/v1/auth/register',
        method: 'post'
    },
    login: {
        url: '/api/v1/auth/login',
        method: 'post'
    },
    logout:{
        url:'api/v1/auth/logout',
        method:'post'
    },
    sendOTP:{
        url:'api/v1/auth/sendotp',
        method:'post'
    },
    verifyOTP:{
        url:'api/v1/auth/verifyotp',
        method:'post'
    },
    resetPassword:{
        url:'api/v1/auth/resetpassword',
        method:'post'
    },

    userDetails: {
        url: '/api/v1/auth/current-user',
        method: 'get'
    },
    pendingUser:{
       url:'/api/v1/auth/get-pending-user',
       method:'get'
    },
    pendingStudent:{
      url:'/api/v1/auth/get-pending-student',
      method:'get'
    },
    pendingTeacher:{
        url:"/api/v1/auth/get-pending-teacher",
        method:"get"
    },
    userDetailsById: {
        url: '/api/v1/auth/user-by-id',
        method: 'post'
    },
     studentStats: {
       url: '/api/v1/auth/studentstat', // append /:id when calling
       method: 'get'
   },
   teacherStats: {
       url: '/api/v1/auth/teacherstat', // append /:id when calling
       method: 'get'
   },

   schoolStats:{
         url:'/api/v1/auth/schoolstat',
         method:'get'
   },
   
    getSubject: {
        url: '/api/v1/classinfo/getsubject',
        method: 'post'
    },
    totalStudentDoubt: {
        url: "/api/v1/doubts/by-student",
        method: 'post'
    },
    createDoubt: {
        url: '/api/v1/doubts/create',
        method: 'post'
    },
    updateDoubt:{
        url:'/api/v1/doubts/updatedoubt',
        method:'post'
    },
    doubtbyId: {
        url: '/api/v1/doubts/doubtbyid',
        method: 'post'
    },
    subjectTeacherDoubt: {
        url: '/api/v1/doubts/by-subject/teacher',
        method: 'post'
    }
    ,
    deleteDoubtFile: {
        url: "/api/v1/doubts/delete-doubt-file",
        method: "post"
    },
    deleteFile: {
        url: "/api/v1/doubts/delete-file",
        method: "post"
    },
    deleteDoubtById: {
        url: "/api/v1/doubts/delete",
        method: "post"
    },
    submitAnswer: {
        url: '/api/v1/doubts/answer',
        method: "post"
    },
    teacherTotalDoubts: {
        url: "/api/v1/doubts/teachertotaldoubt",
        method: 'get'
    },
    registerSubject: {
        url: "/api/v1/classinfo/add-class",
        method: "post"
    },
    updateUser:{
        url:'/api/v1/auth/update',
        method:'put'
    },
    uploadAvatar:{
        url:'/api/v1/auth/update-avatar',
        method:"post"
    },
    uploadfile:{
        url:'/api/file/upload',
        method:'post'
    }
    ,
    changestatus:{
        url:'/api/v1/auth/changestatus',
        method:'post'
    },
    registerSchool:{
        url:'/api/v1/auth/registerschool',
        method:'post'
    },
    schoolLogin:{
       url:'/api/v1/auth/loginschool',
       method:'post'
    },
    updateSchool:{
        url:'/api/v1/auth/update-school',
        method:'post'
    },
    schoolStatus:{
        url:'/api/v1/auth/changeschoolstatus',
        method:'post'
    },
    pendingSchool:{
        url:'/api/v1/auth/pendingschool',
        method:'get'
    },
    currentSchool:{
        url:'/api/v1/auth/currentschool',
        method:'get'
    },
    discussionHistory: {
  url: "/api/v1/discussion/history",
  method: "post"
},
  
studentsBySchoolClass:{
     url:'/api/v1/school/students',
     method:'post'
},
TeachersBySchoolClass:{
    url:'/api/v1/school/teachers',
    method:'post'
},

getUserProfileForSchool:{
    url:'/api/v1/school/profile',
    method:'get'
}


}


export default SummaryAPi;