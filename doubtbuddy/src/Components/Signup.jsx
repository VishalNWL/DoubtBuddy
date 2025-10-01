import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Logo, Select } from './index';
import { useSelector } from 'react-redux';
import Axios from '../Utils/Axios';
import toast from 'react-hot-toast';
import { Atom } from "react-loading-indicators";
import SummaryAPi from '../Common/SummaryApi';
import { Link, useNavigate } from 'react-router-dom';
import { IoEye, IoEyeOff } from "react-icons/io5"; // 👁️ for password toggle

function Signup() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerType, setRegisterType] = useState("user"); // user | school
  const [showPassword, setShowPassword] = useState(false); // 🔹 for school password toggle
  const navigate = useNavigate();
  const { handleSubmit, register, watch , formState:{errors} } = useForm();
  const role = watch("role")?.toLowerCase();

  const handleUserSignup = async (data) => {
    try {
      setLoading(true);
      setError("");
      data.role = data.role.toLowerCase();

      if (data.role === "teacher") {
        if (!data.classInfo) throw new Error("Class info is required for teachers");

        const entries = data.classInfo.split(",").map((s) => s.trim());
        const teacherClasses = [];

        for (let entry of entries) {
          const match = entry.match(/^([A-Z])(\d{1,2})([a-zA-Z]+)$/);
          if (!match) throw new Error(`Invalid format: "${entry}". Use format like A5Physics`);

          const [, batch, classStr, subject] = match;
          teacherClasses.push({
            class: Number(classStr),
            batch,
            subject: subject.trim(),
          });
        }
        data.teacherClasses = teacherClasses;
      }

      if (data.role === "student") {
        if (!data.studentclass || !data.studentbatch) throw new Error("Class and batch is required for students");

        data.class = data.studentclass;
        data.batch = data.studentbatch;

      }

      const session = await Axios({
        ...SummaryAPi.register,
        data: data
      });

      if (session.data.success) {
        toast.success("Registeration request sent successfully");
        navigate('/login');
      }
    } catch (err) {
      console.log(err)
      setError(err.response.data.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSignup = async (data) => {
    try {
      setLoading(true);
      setError("");

      if (/\s/.test(data.schoolId)) {
        throw new Error("School ID must not contain spaces");
      }

      const session = await Axios({
        ...SummaryAPi.registerSchool,
        data
      });

      if (session.data.success) {
        toast.success("School registration request sent successfully");

      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="hidden custom:block">
        <Logo />
      </div>

      <div className="mt-6 w-full max-w-2xl">
        <h1 className="text-blue-800 text-5xl font-poppins text-center">Welcome</h1>
        <h2 className="text-blue-800 text-center text-lg font-poppins mt-2">
          {registerType === "user" ? "Register as User" : "Register a School"}
        </h2>
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
      </div>

      {/* Toggle */}
      <div className="flex gap-4 mt-6">
        <Button
          className={`px-4 py-2 rounded-lg ${registerType === "user" ? "bg-blue-600 text-white" : "bg-gray-400"}`}
          onClick={() => setRegisterType("user")}
        >
          User
        </Button>
        <Button
          className={`px-4 py-2 rounded-lg ${registerType === "school" ? "bg-blue-600 text-white" : "bg-gray-400"}`}
          onClick={() => setRegisterType("school")}
        >
          School
        </Button>
      </div>

      {/* USER REGISTER FORM*/}
      {registerType === "user" && (
        <form
          onSubmit={handleSubmit(handleUserSignup)}
          className="mt-8 px-4 w-full max-w-xl bg-blue-100 rounded-md p-6"
        >
          <div className="space-y-5">
            <Select
              label="Role:"
              placeholder="Select Role"
              options={["Student", "Teacher"]}
              {...register("role", { required: true })}
            />
            <Input label="Email:" placeholder="Enter your email" type="email" {...register("email", { required: true })} />
            <Input label="Username:" placeholder="Enter your username" type="text" {...register("username", { required: true })} />
            <Input label="Full Name:" placeholder="Enter your full name" type="text" {...register("fullname", { required: true })} />

            {role === "teacher" && (
              <Input label="Classes you are teaching" placeholder="e.g., A5Physics, B10Math" type="text" {...register("classInfo", { required: true })} />
            )}


            {role === "student" && (<>
              <Input label="Class" placeholder="Enter your class" type="text" {...register("studentclass", {
                required: true, pattern: {
                  value: /^\d+$/,
                  message: "Class must contain only numbers (e.g., 10, 12)"
                }
              })} />
                <p style={{ color: 'red' }}>
                     {errors?.studentclass?.message}
               </p>
              <Input label="Batch" placeholder="Enter your batch (if not applicable then write A)" type="text" {...register("studentbatch", {
                required: true, pattern: {
                  value: /^[A-Z]+$/,
                  message: "Batch must contain only capital letters (e.g., A, BATCHX)"
                }
              })} />
                  <p style={{ color: 'red' }}>
                       {errors?.studentbatch?.message} 
                 </p>
            </>
            )}
            {(role === "student" || role === "teacher") && (
              <Input label="School:" placeholder="Enter your school name" type="text" {...register("school", { required: true })} />
            )}

            {/* 👁️ PASSWORD FIELD WITH TOGGLE */}
            <div className="relative">
              <Input
                label="Password:"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password", { required: true, minLength: 6 })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-600 hover:text-gray-900"
              >
                {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
            </div>

            <Button type="submit" className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white mt-4" disabled={loading}>
              {loading ? (
                <div className="scale-50 h-7 flex justify-center items-center">
                  <Atom color={["#fff"]} />
                </div>
              ) : (
                "Register User"
              )}
            </Button>
          </div>
          <div className="mt-2">
            Already have a account?{" "}
            <Link
              to={"/login"}
              className="text-blue-600 hover:underline"
            >
              Login
            </Link>
          </div>
        </form>
      )}

      {/* SCHOOL REGISTER FORM (UPDATED WITH PASSWORD + TOGGLE) */}
      {registerType === "school" && (
        <form
          onSubmit={handleSubmit(handleSchoolSignup)}
          className="mt-8 px-4 w-full max-w-xl bg-blue-100 rounded-md p-6"
        >
          <div className="space-y-5">
            <Input label="School Name:" placeholder="Enter school name" type="text" {...register("schoolName", { required: true })} />
            <Input label="Email:" placeholder="Enter your email" type="email" {...register("email", { required: true })} />
            <Input label="Address:" placeholder="Enter address" type="text" {...register("address", { required: true })} />
            <Input label="Pincode:" placeholder="Enter pincode" type="text" {...register("pincode", { required: true })} />
            <Input label="Location:" placeholder="City / State" type="text" {...register("location", { required: true })} />
            <Input label="Contact Number:" placeholder="Enter contact number" type="tel" {...register("contact", { required: true })} />
            <Input label="Country:" placeholder="Enter country" type="text" {...register("country", { required: true })} />
            <Input label="Custom School ID:" placeholder="Unique ID (no spaces)" type="text" {...register("schoolId", { required: true })} />

            {/* 👁️ PASSWORD FIELD WITH TOGGLE */}
            <div className="relative">
              <Input
                label="Password:"
                placeholder="Enter school password"
                type={showPassword ? "text" : "password"}
                {...register("password", { required: true, minLength: 6 })}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
              >
                {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </span>
            </div>

            <Button type="submit" className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white mt-4" disabled={loading}>
              {loading ? (
                <div className="scale-50 h-7 flex justify-center items-center">
                  <Atom color={["#fff"]} />
                </div>
              ) : (
                "Register School"
              )}
            </Button>
          </div>

          <div className="mt-2">
            Already have a account?{" "}
            <Link
              to={"/login"}
              className="text-blue-600 hover:underline"
            >
              Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default Signup;
