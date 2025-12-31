import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from "./index";
import { Atom } from "react-loading-indicators";
import Axios from "../Utils/Axios";
import toast from "react-hot-toast";
import SummaryAPi from "../Common/SummaryApi";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Link } from "react-router-dom";
import AddClassPage from "./AddClassPage";

function SchoolSignup() {

  const indianPinRegex = /^[1-9][0-9]{5}$/;

  const { handleSubmit, register } = useForm();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAddClassPage,setShowClassPage] = useState(false);
  const [schoolClassData ,setSchoolClassData]=useState(null);


  const handleSchoolSignup = async (data) => {
    try {
      setLoading(true);
      setError("");

      if (/\s/.test(data.schoolId)) {
        throw new Error("School ID must not contain spaces");
      }  
    
   if (!indianPinRegex.test(data.pincode)) {
    setError("Please enter a valid 6-digit Indian PIN code");
    alert("Enter valid Indian Pincode");
    return;
  }

if (!schoolClassData || !Array.isArray(schoolClassData.classes) || schoolClassData.classes.length === 0) {
    alert("Add the classes for the school");
  return ;
}

      const session = await Axios({
        ...SummaryAPi.registerSchool,
        data:{
          ...data,
          ...schoolClassData
        }
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
    <>
    <form
      onSubmit={handleSubmit(handleSchoolSignup)}
      className="mt-8 px-4 w-full max-w-xl bg-blue-100 rounded-md p-6"
    >
      <h2 className="text-blue-800 text-center text-lg font-poppins mb-4">
        Register a School
      </h2>

      {error && <p className="text-red-600 text-center">{error}</p>}

      <div className="space-y-5">

        <Input label="School Name:" placeholder='Enter the school name' type="text" {...register("schoolName", { required: true })} />
        <Input label="Email:" placeholder="Enter Email" type="email" {...register("email", { required: true })} />
        <Input label="Address:" placeholder="Enter school Address" type="text" {...register("address", { required: true })} />
        <Input label="Country:" placeholder="Country" type="text" {...register("country", { required: true })} />
        <Input label="Location:" placeholder="City and State" type="text" {...register("location", { required: true })} />
        <Input label="Pincode:" placeholder="Enter the Pincode" type="text" {...register("pincode", { required: true })} />
        <Input label="Contact Number:" placeholder="Enter the contact no." type="tel" {...register("contact", { required: true })} />
        <Input label="Custom School ID:" placeholder="Create your school ID" type="text" {...register("schoolId", { required: true })} />

        <div className="relative">
          <Input
            label="Password:"
            placeholder="Enter Password"
            type={showPassword ? "text" : "password"}
            {...register("password", { required: true, minLength: 6 })}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 cursor-pointer text-gray-600"
          >
            {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
          </span>
        </div>

       <Button type="button" bgColor="bg-black" onClick={()=>{
         setShowClassPage(true);
       }}>Add Classes</Button>

        <Button
          type="submit"
          className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white mt-4"
          disabled={loading}
        >
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
        Already have an account?{" "}
        <Link to={"/login"} className="text-blue-600 hover:underline">
          Login
        </Link>
      </div>
    </form>
      {showAddClassPage && <AddClassPage
     close={() => setShowClassPage(false)}
      onSave={(data) => {
    setSchoolClassData(data);
  }}
  initialData={schoolClassData}
/>}
    </>
  );
}

export default SchoolSignup;
