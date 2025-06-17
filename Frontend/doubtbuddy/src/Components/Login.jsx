import React,{useState} from 'react'
import {Link ,useNavigate} from 'react-router-dom'
import {login as authLogin} from '../store/authSlice'
import {Button, Input,Logo} from './index'
import { useDispatch } from 'react-redux'
import { useForm} from 'react-hook-form'

function Login(){
    const [error,seterror]=useState('');
    // const navigate=useNavigate();
    const dispatch=useDispatch();
   
    const {handleSubmit,register} = useForm();

    const login= async (data)=>{
           seterror("");
           try {
               const session= await fetch(`http://localhost:${import.meta.env.PORT}/api/v1/auth/login`,{
                method:"GET",
                body: JSON.stringify(data)
               })

             if(session){

                const user= await fetch(`http://localhost:${import.meta.env.PORT}/api/v1/auth/current-user`,{method:"GET"});
                if(user) dispatch(authLogin(user));
                // navigate('/');

             }

           } catch (error) {
              seterror(error.message);
           }
    }

    return (
        <>
           <h1>hello </h1>
        </>
    )
}

export default Login