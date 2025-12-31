import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../Components/index';
import { useDispatch, useSelector } from 'react-redux';
import Axios from '../Utils/Axios';
import toast from 'react-hot-toast';
import { Atom } from "react-loading-indicators";
import SummaryAPi from '../Common/SummaryApi';
import { useNavigate } from 'react-router-dom';
import { IoEye, IoEyeOff } from "react-icons/io5";
import { login, logout } from '../store/authSlice';
import AddClassPage from '../Components/AddClassPage';

function SchoolProfile() {

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  const user = useSelector(state => state.auth).userData;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { handleSubmit, register } = useForm({
    defaultValues: {
      schoolId: user.schoolId,
      schoolName: user.schoolName,
      email: user.email,
      address: user.address,
      pincode: user.pincode,
      location: user.location,
      contactNo: user.contactNo,
      country: user.country,
    }
  });

  // store school class structure
const SchoolInfo = useSelector((state)=>state.auth.userData);

const [schoolClassData, setSchoolClassData] = useState({
  classes: SchoolInfo?.classes || [],
  OptionalSubjects: SchoolInfo?.OptionalSubjects || []
});

  // Refresh Redux data after update
  const updateUserDataOnWebsite = async ()=>{
    try{
      setLoading(true);
      const res = await Axios({...SummaryAPi.userDetails});
      if(res.data.success){
        dispatch(login(res.data.data));
      }
      else{
        dispatch(logout());
        navigate("/login");
      }
    }catch(err){
      dispatch(logout());
    }finally{
      setLoading(false);
    }
  }


  const handleSchoolUpdate = async (data)=>{

    try{
      setLoading(true);
      setError("");


    const payload = {
      ...data,
      ...schoolClassData,
    };
      const res = await Axios({
        ...SummaryAPi.updateSchool,
        data: payload
      });

      if(res.data.success){
        toast.success("School updated successfully");
        updateUserDataOnWebsite();
      }

    }catch(err){
      setError(err?.response?.data?.message || "Something went wrong");
    }finally{
      setLoading(false);
    }

  }


  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">

      <form
        onSubmit={handleSubmit(handleSchoolUpdate)}
        className="mt-8 px-4 w-full max-w-xl bg-blue-100 rounded-md p-6"
      >

        {error && <p className="text-red-600 text-center">{error}</p>}

        <div className="space-y-5">

          <Input label="School ID" disabled type="text" {...register("schoolId")} />
          <Input label="School Name" disabled type="text" {...register("schoolName")} />

          <Input label="Email" type="email" {...register("email",{required:true})} />
          <Input label="Address" type="text" {...register("address",{required:true})} />
          <Input label="Pincode" type="text" {...register("pincode",{required:true})} />
          <Input label="Location" type="text" {...register("location",{required:true})} />
          <Input label="Contact Number" type="tel" {...register("contactNo",{required:true})} />
          <Input label="Country" type="text" {...register("country",{required:true})} />

          {/* --------- CLASSES BUTTON --------- */}
          <Button
            type="button"
            bgColor="bg-black"
            onClick={()=>setShowClassModal(true)}
          >
            Edit Classes & Streams
          </Button>


          {/* -------- PASSWORD FIELD -------- */}
          <div className="relative">
            <Input
              label="Password"
              placeholder="Leave empty to keep same"
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <span
              onClick={()=>setShowPassword(!showPassword)}
              className="absolute right-3 top-9 cursor-pointer text-gray-600"
            >
              {showPassword ? <IoEyeOff size={20}/> : <IoEye size={20}/>}
            </span>
          </div>


          <Button type="submit" disabled={loading}>
            {loading ? <div className="scale-50 h-7 flex justify-center items-center">
                          <Atom color={["#fff"]} />
                        </div>: "Update School"}
          </Button>

        </div>
      </form>


      {/* -------- MODAL -------- */}
      {showClassModal && (
        <AddClassPage
          close={()=>setShowClassModal(false)}
          onSave={(data)=>setSchoolClassData(data)}
          initialData={schoolClassData}
        />
      )}

    </div>
  );
}

export default SchoolProfile;
