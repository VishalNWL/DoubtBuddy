import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Logo, Select } from './index';
import { useDispatch, useSelector } from 'react-redux';
import { login as authLogin } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import Axios from '../Utils/Axios';
import SummaryAPi from '../Common/SummaryApi';

function Signup() {
  const [error, setError] = useState("");
  const { handleSubmit, register, watch } = useForm();
  const user = useSelector(state=>state.auth).userData

 
  if(user.role !== "admin"){
     window.history.back();
  }

  const role = watch("role")?.toLowerCase(); // Normalize casing

  const signup = async (data) => {
    setError("");
    try {
 
      console.log("This is user data",data)
      data.role= data.role.toLowerCase();

      if (data.role === "teacher") {
        if (!data.classInfo) throw new Error("Class info is required for teachers");


        const entries = data.classInfo.split(",").map((s) => s.trim());
        const teacherClasses = [];

        for (let entry of entries) {
          // Match: A5Physics, B10Math, etc.
          const match = entry.match(/^([A-Z])(\d{1,2})([a-zA-Z]+)$/);
          if (!match) {
            throw new Error(
              `Invalid format: "${entry}". Use format like A5Physics (batch, class, subject)`
            );
          }

          const [, batch, classStr, subject] = match;
          teacherClasses.push({
            class: Number(classStr),
            batch,
            subject: subject.trim(),
          });
        }
        console.log(teacherClasses);
        data.teacherClasses = teacherClasses
      }


      if (data.role === "student") {
        if (!data.classInfo) throw new Error("Class info is required for students");

        const match = data.classInfo.match(/^(\d+)([A-Z])$/);
        if (!match) throw new Error("Invalid class format. Use format like 5A");

        const [, classNum, batch] = match;

        data.class = classNum
        data.batch = batch

      }

      const session = await Axios({
        ...SummaryAPi.register,
        data:data
      })

      console.log(session)

      // if (!session.ok) throw new Error("Registration failed");

      // const res = await fetch(`http://localhost:${port}/api/v1/auth/current-user`, {
      //   method: "GET",
      // });

      // const user = await res.json();
      // if (user) {
      //   dispatch(authLogin(user));
      //   navigate("/");
      // } else {
      //   throw new Error("User fetch after registration failed");
      // }
      // navigate('/')
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="hidden custom:block">
        <Logo />
      </div>

      <div className="mt-6 w-full max-w-xl">
        <h1 className="text-blue-800 text-6xl font-poppins text-center">Welcome</h1>
        {!error && <h2 className="text-blue-800 text-center text-lg font-poppins">Register here</h2>}
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
      </div>

      <form
        onSubmit={handleSubmit(signup)}
        className="mt-8 px-4 w-full max-w-xl bg-blue-100 rounded-md p-6"
      >
        <div className="space-y-5">
          <Select
            label="Role:"
            options={["Student", "Teacher", "Admin"]}
            {...register("role", { required: true })}
          />

          <Input
            label="Email:"
            placeholder="Enter your email"
            type="email"
            {...register("email", {
              required: true,
              validate: {
                matchPattern: (value) =>
                  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                  "Email address must be valid",
              },
            })}
          />

          <Input
            label="Username:"
            placeholder="Enter your username"
            type="text"
            {...register("username", { required: true })}
          />

          <Input
            label="Full Name:"
            placeholder="Enter your full name"
            type="text"
            {...register("fullname", { required: true })}
          />

          {role === "teacher" && (
            <Input
              label="Classes you are teaching"
              placeholder="e.g., A5Physics, B10Math, C8English"
              type="text"
              {...register("classInfo", {
                required: "Please enter class info for teacher (e.g., A5Physics)",
                pattern: {
                  value: /^([A-Z]\d{1,2}[a-zA-Z]+)(,\s*[A-Z]\d{1,2}[a-zA-Z]+)*$/,
                  message: "Format should be A5Physics, B10Math (no spaces inside entry)",
                },
              })}
            />

          )}

          {role === "student" && (
            <Input
              label="Class and batch"
              placeholder="Enter Your Class like 5A"
              type="text"
              {...register("classInfo", {
                required: "Please enter class info",
                pattern: {
                  value: /^\d+[A-Z]$/,
                  message: "Use format like 5A",
                },
              })}
            />
          )}

          {(role === "student" || role === "teacher") && (
            <>
              <Input
                label="School:"
                placeholder="Enter Your School Name"
                type="text"
                {...register("school", {
                  required: "Please enter your school name",
                })}
              />
            </>
          )}

          <Input
            label="Password:"
            type="password"
            placeholder="Enter your password"
            {...register("password", {
              required: true,
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          <Button type="submit" className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white mt-4">
            Register
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Signup;
