import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../Components/index';
import Axios from '../Utils/Axios';
import SummaryAPi from '../Common/SummaryApi';
import { FaUserCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux'
import { MdModeEdit } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import UploadImage from '../Utils/UploadImage';
import { login } from "../store/authSlice"
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { IoEye, IoEyeOff } from "react-icons/io5";

function Profile() {

  const user = useSelector(state => state.auth).userData;
  console.log(user)
  const role = user.role;
  const dispatch = useDispatch();

  const { handleSubmit, register } = useForm();

  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [openEditAvatar, setOpenEditAvatar] = useState(false);
  const [avatarUploadingLoader, setavatarUploadingLoader] = useState(false);

  const [loading, setloading] = useState(false);

  // ------------ SCHOOL DATA -------------
  const [schoolData, setSchoolData] = useState(null);
  const [coreSubjects, setCoreSubjects] = useState([]);
  const [optionalSubjects, setOptionalSubjects] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ------------ TEACHER STATE -------------
  const [entries, setEntries] = useState(user.teacherClasses || []);
  const [current, setCurrent] = useState({ class: "", batch: "", subject: "" });

const [availableBatches, setAvailableBatches] = useState([]);
const [availableSubjects, setAvailableSubjects] = useState([]);

  // ------------ STUDENT STATE -------------
  const [studentClass] = useState(user.class || "");
  const [studentBatch] = useState(user.batch || "");
  const [studentStream] = useState(user.stream || "");
  const [studentOptionalSubject] = useState(user.optionalSubject || "");

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await Axios({
          ...SummaryAPi.getSchoolDetailsByUniqueId,
          data: { schoolId: user.school }
        });

        if (res.data.success) {
          setSchoolData(res.data.data.school);
          setCoreSubjects(res.data.data.coreSubject || []);
          setOptionalSubjects(res.data.data.school?.OptionalSubjects || []);
        }
      } catch { }
    };

    fetchSchool();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const USER = await Axios({ ...SummaryAPi.userDetails });
      if (USER.data.success) dispatch(login(USER.data.data));
    } catch { }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    setavatarUploadingLoader(true);

    try {
      const avatar = await UploadImage(file);

      const response = await Axios({
        ...SummaryAPi.uploadAvatar,
        data: { avatar }
      });

      if (response.data.success) {
        toast.success("Avatar uploaded successfully");
        setAvatarPreview(response.data.data.avatar);
        fetchUserDetails();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setavatarUploadingLoader(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setloading(true);

      if (data.password || data.confirmPassword) {
        if (data.password !== data.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
      }

      if (role === "teacher") data.teacherClasses = entries;

      if (role === "student") {
        data.class = studentClass;
        data.batch = studentBatch;
        data.stream = studentStream || null;
        data.optionalSubject = studentOptionalSubject || null;
      }

      const session = await Axios({
        ...SummaryAPi.updateUser,
        data
      });

      if (session.data.success) {
        toast.success(session.data.message);
        fetchUserDetails();
      }

    } finally {
      setloading(false);
    }
  };

  return (
    <section>

      {/* Avatar */}
      <div className="flex items-center justify-center mt-2">
        <div className="relative group w-24 h-24 cursor-pointer">
          {avatarPreview
            ? <img src={avatarPreview} className="w-24 h-24 rounded-full object-cover" />
            : <FaUserCircle size={96} style={{ color: "#bcbcbc" }} />
          }

          <div
            onClick={() => setOpenEditAvatar(true)}
            className="absolute inset-0 rounded-full bg-black bg-opacity-70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <MdModeEdit size={20} />
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className='mt-0 px-2'>
        <div className="w-full flex flex-col items-center justify-center">

          <form onSubmit={handleSubmit(updateProfile)} className="mt-8 px-4 w-full max-w-xl bg-blue-100 rounded-md p-6">

            <div className="space-y-5">

              <Input label="Role:" defaultValue={user.role} disabled />
              <Input label="Email:" defaultValue={user.email} type="email" {...register("email")} />
              <Input label="Username:" defaultValue={user.username} disabled />
              <Input label="Full Name:" defaultValue={user.fullname} disabled {...register("fullname")} />

              {/* -------- TEACHER -------- */}
              {role === "teacher" && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {entries.map((e, i) => (
                      <div key={i} className="px-3 py-1 bg-gray-200 rounded flex items-center gap-2">
                        {e.class} • {e.batch} • {e.subject}
                        <button type="button" onClick={() => setEntries(entries.filter((_, idx) => idx !== i))}>×</button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <select
                      value={current.class}
                      onChange={e => {
                        const c = e.target.value;
                        setCurrent({ class: c, batch: "", subject: "" });

                        const info = schoolData?.classes?.find(x => String(x.class) === c);
                        setAvailableBatches(info?.batches || []);
                      }}
                      className="border rounded px-3 py-1"
                    >
                      <option value="">Class</option>
                      {schoolData?.classes?.map(c => (
                        <option key={c.class}>{c.class}</option>
                      ))}
                    </select>

                    <select
                      value={current.batch}
                      onChange={e => setCurrent(prev => ({ ...prev, batch: e.target.value }))}
                      className="border rounded px-3 py-1"
                    >
                      <option value="">Batch</option>
                      {availableBatches.map(b => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>

                    <select
                      value={current.subject}
                      onChange={e => setCurrent(prev => ({ ...prev, subject: e.target.value }))}
                      className="border rounded px-3 py-1"
                    >
                      <option value="">Subject</option>
                      {availableSubjects.map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>

                    <Button
                      type="button"
                      onClick={() => {
                        if (!current.class || !current.batch || !current.subject)
                          return toast.error("Fill all fields");

                        setEntries(prev => [...prev, current]);
                        setCurrent({ class: "", batch: "", subject: "" });
                      }}>
                      Add
                    </Button>
                  </div>
                </>
              )}

              {/* -------- STUDENT (READ ONLY) -------- */}
              {role === "student" && (
                <div className="space-y-3">

                  <select
                    value={studentClass}
                    disabled
                    className="border rounded px-3 py-1 w-full cursor-not-allowed"
                  >
                    <option>{studentClass}</option>
                  </select>

                  <select
                    value={studentBatch}
                    disabled
                    className="border rounded px-3 py-1 w-full cursor-not-allowed"
                  >
                    <option>{studentBatch}</option>
                  </select>

                  {Number(studentClass) >= 11 && (
                    <>
                      <select
                        value={studentStream}
                        disabled
                        className="border rounded px-3 py-1 w-full cursor-not-allowed"
                      >
                        <option>{studentStream}</option>
                      </select>

                      <select
                        value={studentOptionalSubject}
                        disabled
                        className="border rounded px-3 py-1 w-full cursor-not-allowed"
                      >
                        <option>{studentOptionalSubject}</option>
                      </select>
                    </>
                  )}

                </div>
              )}

              <Input label="School" defaultValue={user.school} disabled />
              {/* -------- PASSWORD UPDATE (OPTIONAL) -------- */}
              {/* -------- PASSWORD UPDATE -------- */}
              <div className="relative">
                <label className="text-sm font-medium">New Password</label>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Leave empty if no change"
                  className="border rounded px-3 py-2 w-full mt-1"
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-10 text-gray-600"
                >
                  {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                </button>
              </div>


              <div className="relative">
                <label className="text-sm font-medium">Confirm Password</label>

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  className="border rounded px-3 py-2 w-full mt-1"
                  {...register("confirmPassword")}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-3 top-10 text-gray-600"
                >
                  {showConfirmPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                </button>
              </div>


              <Button type="submit" className="w-full bg-blue-600 text-white mt-4" disabled={loading}>
                {loading ? <ClipLoader color="white" size={20} /> : "Update"}
              </Button>

            </div>

          </form>
        </div>
      </div>

      {/* -------- Avatar Modal -------- */}
      {openEditAvatar &&
        <div className='absolute z-50 bg-black bg-opacity-80 inset-0 flex justify-center items-center'>
          <div className='min-w-60 bg-white rounded p-2'>
            <div className='ml-auto w-fit cursor-pointer hover:text-red-500' onClick={() => setOpenEditAvatar(false)}>
              <IoClose size={20} />
            </div>

            <div className="flex justify-center mt-2">
              {avatarUploadingLoader
                ? <ClipLoader color="blue" />
                : avatarPreview
                  ? <img className='w-24 h-24 rounded-full' src={avatarPreview} />
                  : <FaUserCircle size={96} />
              }
            </div>

            <div className='w-full flex justify-center mt-3'>
              <label htmlFor='uploadimg' className='px-3 py-1 rounded bg-blue-600 text-white cursor-pointer'>
                Upload
              </label>
              <input id='uploadimg' type='file' className='hidden' onChange={handleUploadAvatar} disabled={avatarUploadingLoader} />
            </div>

          </div>
        </div>
      }

    </section>
  );
}

export default Profile;
