import { createSlice } from "@reduxjs/toolkit";


const initialState={
    status:false,
    studentSubject:null,
}


const academics= createSlice({
    name:"studentAcademics",
    initialState,
    reducers:{
        setSubject:(state, action)=>{
            state.status = true
            state.studentSubject=action.payload
        },
         
        resetSubject:(state)=>{
            state.status=false
            state.studentSubject=null
        },

    }
})

export const {setSubject,resetSubject} = academics.actions;

export default academics.reducer;