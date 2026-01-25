import { configureStore } from "@reduxjs/toolkit";
import authReducer from './authSlice.js'
import academicReducer from './studentSlice.js'


const store = configureStore({
    reducer:{
        auth:authReducer,
        academics:academicReducer
    }
})

export default store