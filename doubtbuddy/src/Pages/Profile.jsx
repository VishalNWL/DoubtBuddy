import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../Components/index';
import Axios from '../Utils/Axios';
import SummaryAPi from '../Common/SummaryApi';
import { FaUserCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux'
import { MdModeEdit } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import UploadImage from '../Utils/UploadImage';
import { login, logout } from "../store/authSlice"
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

function Profile() {
  const user = useSelector(state => state.auth).userData;
  const role = user.role;
  const [error, setError] = useState("");
  const { handleSubmit, register } = useForm();
  const [openEditAvatar, setOpenEditAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar)
  const dispatch = useDispatch();
  const [loading, setloading] = useState(false);
  const [avatarUploadingLoader, setavatarUploadingLoader] = useState(false);

  const fetchUserDetails = async () => {
    try {
      const USER = await Axios({ ...SummaryAPi.userDetails });
      if (USER.data.success) {
        dispatch(login(USER.data.data));
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    setavatarUploadingLoader(true);
    try {
      if (file) {
        // Check MIME type
        if (!file.type.startsWith("image/")) {
          alert("Only image files are allowed!");
          return;
        }

        // Optional: size limit (e.g., 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert("File size must be under 2MB");
          return;
        }
        const avatar = await UploadImage(file);
        console.log(avatar)
        if (!avatar) {
          alert("There is some error while uploading avatar");
          return;
        }


        const response = await Axios({
          ...SummaryAPi.uploadAvatar,
          data: { avatar }
        })

        if (response.data.success) {
          toast.success("Avatar uploaded successfully")
          setAvatarPreview(response.data.data.avatar)
          fetchUserDetails();
        }

      }

    } catch (error) {
      toast.error(error.message)
    }
    finally {
      setavatarUploadingLoader(false);
    }
  }

  const updateProfile = async (data) => {
    setError("");
    try {
      setloading(true);

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
        ...SummaryAPi.updateUser,
        data: data
      })

      if (session.data.success) {
        toast.success(session.data.message);
        fetchUserDetails();
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    }
    finally {
      setloading(false);
    }
  };



  return (
    <section>
      <div className="flex items-center justify-center mt-2">
        <div className="relative group w-24 h-24 cursor-pointer">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle size={96} style={{ color: "#bcbcbc" }} />
          )}

          {/* Overlay appears only when hovering avatar */}
          <div onClick={() => setOpenEditAvatar(true)} className="absolute inset-0 rounded-full bg-black bg-opacity-70 text-white 
                          flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <MdModeEdit size={20} />
          </div>
        </div>
      </div>

      <div className='mt-0 px-2'>
        <div className="w-full flex flex-col items-center justify-center">
          <form
            onSubmit={handleSubmit(updateProfile)}
            className="mt-8 px-4 w-full max-w-xl bg-blue-100 rounded-md p-6"
          >
            <div className="space-y-5">
              <Input
                label="Role:"
                defaultValue={user.role}
                disabled
              />

              <Input
                label="Email:"
                placeholder="Enter your email"
                type="email"
                defaultValue={user.email}
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
                defaultValue={user.username}
                {...register("username", { required: true })}
              />

              <Input
                label="Full Name:"
                placeholder="Enter your full name"
                defaultValue={user.fullname}
                type="text"
                {...register("fullname", { required: true })}
              />

              {user.role === "teacher" && (
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

              {user.role === "student" && (
                <Input
                  label="Class and batch"
                  placeholder="Enter Your Class like 5A"
                  type="text"
                  defaultValue={user.class + user.batch}
                  {...register("classInfo", {
                    required: "Please enter class info",
                    pattern: {
                      value: /^\d+[A-Z]$/,
                      message: "Use format like 5A",
                    },
                  })}
                />
              )}

              {(user.role === "student" || role === "teacher") && (
                <>
                  <Input
                    label="School:"
                    placeholder="Enter Your School Name"
                    defaultValue={user.school}
                    type="text"
                    {...register("school", {
                      required: "Please enter your school name",
                    })}
                  />
                </>
              )}

              <Button type="submit" className={`w-full px-4 py-2 rounded-lg bg-blue-600 text-white mt-4 ${loading
                ? "bg-slate-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}`} disabled={loading}>
                {loading ?
                  <div className='flex items-center justify-center'>
                    <ClipLoader
                      color='white'
                      size={24}
                    />

                  </div> :
                  "Update"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {
        openEditAvatar &&
        <div className='absolute z-50 bg-black bg-opacity-80 top-0 left-0 right-0 bottom-0 flex justify-center items-center'>
          <div className='min-w-60 bg-white min-h-5 rounded p-1'>
            <div className='w-fit ml-auto text-[#1a1a1a] cursor-pointer hover:text-red-500' onClick={() => setOpenEditAvatar(false)}>
              <IoClose size={20} />
            </div>
            <div>
              <div className="flex items-center justify-center mt-1">
                <div className="relative w-24 h-24">
                  {
                    avatarUploadingLoader ? (
                      <div className="flex items-center justify-center h-full rounded-full bg-gray-200">
                        <ClipLoader color="blue" size={20} />
                      </div>
                    ) : avatarPreview ? (
                      <img
                        src={avatarPreview}
                        className="w-24 h-24 rounded-full object-cover"
                        alt="avatar"
                      />
                    ) : (
                      <FaUserCircle size={96} style={{ color: "gray" }} />
                    )
                  }
                </div>
              </div>
            </div>

            <div className='w-full flex justify-center my-2'>
              <label htmlFor='uploadimg' className={`px-2 py-1 mt-2 rounded text-white transition-colors
    ${avatarUploadingLoader
                  ? "bg-slate-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}
  `}>Upload</label>
              <input type='file' accept="image/*"
                disabled={avatarUploadingLoader}
                onChange={handleUploadAvatar}
                className='hidden' id='uploadimg'></input>
            </div>
          </div>
        </div>
      }

    </section>
  )
}

export default Profile