

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
    userDetails: {
        url: '/api/v1/auth/current-user',
        method: 'get'
    },
    userDetailsById: {
        url: '/api/v1/auth/user-by-id',
        method: 'post'
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
    doubtbyId: {
        url: '/api/v1/doubts/doubtbyid',
        method: 'post'
    },
    subjectTeacherDoubt: {
        url: '/api/v1/doubts/by-subject/teacher',
        method: 'post'
    }
    ,
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
    }
}


export default SummaryAPi;