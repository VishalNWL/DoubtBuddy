import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import { Button, Input, Logo } from './index.js'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import Axios from '../Utils/Axios.js'
import SummaryAPi from '../Common/SummaryApi.js'



function Login() {
  const [error, seterror] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { handleSubmit, register } = useForm();
  const user = useSelector((state) => state.auth).userData


  const login = async (data) => {
    seterror("");

    try {

      const session = await Axios({
        ...SummaryAPi.login,
        data: data
      })


      if (session.data.success) {
        alert("Successfully logged in");

        localStorage.setItem("accesstoken", session.data.data.accessToken);
        localStorage.setItem("refreshtoken", session.data.data.refreshToken);

        const userResponse = await Axios({
          ...SummaryAPi.userDetails,

        })


        if (userResponse.data.success) {
          const userData = userResponse.data.data;
          dispatch(authLogin(userData));

          if (userData?.role === 'teacher') {
            navigate('/teacherdashboard');
          } else if (userData?.role === 'student') {
            navigate('/studentdashboard');
          }
        }

      }

      else {
        seterror("User not Registered");
      }

    } catch (err) {
      seterror(err.message);
    }
  }


  if (user) {
    if (user?.role === 'teacher') {
      navigate('/teacherdashboard');
    } else if (user?.role === 'student') {
      navigate('/studentdashboard');
    }
  }

  return (
    !user &&
    <>
      <div className='w-full min-h-screen flex flex-col flex-nowrap custom:items-center custom:justify-center'>
        <div className='h-[20rem] w-full bg-blue-600
  rounded-tr-[10rem] rounded-bl-[10rem] custom:w-[50%] custom:hidden flex items-center justify-center'> <Logo></Logo></div>

        <div className='hidden custom:block '>
          <Logo></Logo>
        </div>

        <div className='mt-6 custom:w-[50%] block '>
          <h1 className='text-blue-800 text-6xl font-poppins text-center'>Welcome</h1>
          {!error && <h2 className='text-blue-800 text-center text-lg font-poppins'>Login to your account to continue</h2>}
          {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
        </div>

        <form onSubmit={handleSubmit(login)} className='mt-8 pl-4 pr-4 custom:bg-blue-100 custom:rounded-md custom:p-10 block'>
          <div className='space-y-5'>
            <Input
              label="Username: "
              placeholder="Enter your Username"
              type="text"
              {...register("username", {
                required: true,
              })}
            />
            <Input
              label="Email: "
              placeholder="Enter your email"
              type="text"
              {...register("email", {
                required: true
              })}
            />

            <Input
              label="Password: "
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: true,
              })}
            />
            <Button type="submit" className="w-full `px-4 py-2 rounded-lg bg-blue-600 text-white mt-10">
              Login
            </Button>
          </div>
        </form>

      </div>
    </>
  )
}

export default Login