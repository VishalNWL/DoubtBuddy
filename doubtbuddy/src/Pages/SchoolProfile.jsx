import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Logo, Select } from '../Components/index';
import { useDispatch, useSelector } from 'react-redux';
import Axios from '../Utils/Axios';
import toast from 'react-hot-toast';
import { Atom } from "react-loading-indicators";
import SummaryAPi from '../Common/SummaryApi';
import { Link, useNavigate } from 'react-router-dom';
import { IoEye, IoEyeOff } from "react-icons/io5"; // 👁️ for password toggle
import { login, logout } from '../store/authSlice';

function SchoolProfile() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 🔹 for school password toggle
  const navigate = useNavigate();
  const { handleSubmit, register, watch , formState:{errors} } = useForm();
  const user = useSelector(state=>state.auth).userData;
  const [schoolClasses, setSchoolClasses] = useState("");
  const dispatch = useDispatch();

  useEffect(()=>{
    console.log(user)
     if (user?.classes) {
    setSchoolClasses(user.classes.map((c) => String(c)).join(",")); // join to make it a comma-separated string
  }
  },[])

  const updateUserDataOnWebsite= async ()=>{
    
    try {
      setLoading(true);
      const user = await Axios({...SummaryAPi.userDetails});
       
      if (user.data.success) {
        dispatch(login(user.data.data));
      } else {
        dispatch(logout());
        navigate('/login');
      }
    } catch (err) {
      console.error('User check failed:', err);
      dispatch(logout());
    } finally {
      setLoading(false);
    }
  }


  const handleSchoolUpdate = async (data) => {
    try {
      setLoading(true);
      setError("");

    data.classes = data.classes.split(",").map((v) => Number(v.trim()));


     console.log(data.classes)
      const session = await Axios({
        ...SummaryAPi.updateSchool,
        data
      });
       
      if (session.data.success) {
        toast.success("School updated successfully");
         
        updateUserDataOnWebsite();

      }
    } catch (err) {
      setError(err.response.data.message|| "Something went wrong");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
    
        <form
          onSubmit={handleSubmit(handleSchoolUpdate)}
          className="mt-8 px-4 w-full max-w-xl bg-blue-100 rounded-md p-6"
        >
        <p className='text-red text-center mb-3'>{error}</p>
          <div className="space-y-5">
            <Input label="School ID:" disabled defaultValue={user.schoolId} placeholder="Unique ID (no spaces)" type="text" {...register("schoolId", { required: true })} />
            <Input label="School Name:" disabled defaultValue={user.schoolName} placeholder="Enter school name" type="text" {...register("schoolName", { required: true })} />

            <Input label="Email:" defaultValue={user.email} placeholder="Enter your email" type="email" {...register("email", { required: true })} />
            <Input label="Classes" defaultValue={schoolClasses} placeholder='Classes available' type = "text"  {...register("classes", {
          required: "Classes required",
          pattern: {
            value: /^(?:([1-9]|1[0-2])(,(?:[1-9]|1[0-2])){0,11})$/,
            message:
              "Only numbers 1–12 are allowed, up to 12 numbers, comma-separated",
          },
          validate: (value) => {
            const numbers = value.split(",").filter(Boolean);
            const hasDuplicates = new Set(numbers).size !== numbers.length;
            return hasDuplicates ? "Duplicate numbers are not allowed" : true;
          }
        })}/>

         {errors.classes && (
        <p className="text-red-500">{errors.classes.message}</p>
      )}

            <Input label="Address:" defaultValue={user.address} placeholder="Enter address" type="text" {...register("address", { required: true })} />
            <Input label="Pincode:" defaultValue={user.pincode} placeholder="Enter pincode" type="text" {...register("pincode", { required: true })} />
            <Input label="Location:" defaultValue={user.location} placeholder="City / State" type="text" {...register("location", { required: true })} />
            <Input label="Contact Number:" defaultValue={user.contactNo} placeholder="Enter contact number" type="tel" {...register("contactNo", { required: true })} />
            <Input label="Country:" defaultValue={user.country} placeholder="Enter country" type="text" {...register("country", { required: true })} />

            {/* 👁️ PASSWORD FIELD WITH TOGGLE */}
            <div className="relative">
              <Input
                label="Password:"
                placeholder="If don't want to change then keep empty"
                type={showPassword ? "text" : "password"}
                {...register("password",{required:false , minLength:6})}
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
                "Update School"
              )}
            </Button>
          </div>
        </form>
    </div>
  );
}

export default SchoolProfile;
