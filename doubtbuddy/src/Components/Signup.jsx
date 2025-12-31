import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Logo, Select } from './index';
import { useSelector } from 'react-redux';
import Axios from '../Utils/Axios';
import toast from 'react-hot-toast';
import { Atom } from "react-loading-indicators";
import SchoolSignup from "./SchoolSignup.jsx";
import SummaryAPi from '../Common/SummaryApi';
import { Link, useNavigate } from 'react-router-dom';
import { IoEye, IoEyeOff } from "react-icons/io5"; // 👁️ for password toggle

function Signup() { 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerType, setRegisterType] = useState("user"); // user | school
  const [showPassword, setShowPassword] = useState(false); // 🔹 for school password toggle
  const [school ,setSchool] = useState("");
  const navigate = useNavigate();
 const { handleSubmit, register, watch, setValue, formState:{errors} } = useForm();
  const role = watch("role")?.toLowerCase();
  const [entries, setEntries] = useState([]);
const [current, setCurrent] = useState({
  class: "",
  batch: "",
  subject: ""
});
const [schoolData, setSchoolData] = useState(null);
const [availableBatches, setAvailableBatches] = useState([]);
const [availableSubjects, setAvailableSubjects] = useState([]);
const [subjectSearch, setSubjectSearch] = useState("");
const [coreSubjects, setCoreSubjects] = useState([]);
const [optionalSubjects, setOptionalSubjects] = useState([]);

const [studentClass, setStudentClass] = useState("");
const [studentBatch, setStudentBatch] = useState("");
const [studentStream, setStudentStream] = useState("");
const [studentOptionalSubject, setStudentOptionalSubject] = useState("");

useEffect(() => {
  setValue("classInfo", JSON.stringify(entries || []));
}, [entries, setValue]);



  const handleUserSignup = async (data) => {
    try {
      setLoading(true);
      setError("");
      data.role = data.role.toLowerCase();

  if (data.role === "teacher") {

  if (!data.classInfo) throw new Error("Class info is required for teachers");

  const teacherClasses = JSON.parse(data.classInfo);

  if (!Array.isArray(teacherClasses) || teacherClasses.length === 0) {
    throw new Error("Please add at least one class");
  }

  data.teacherClasses = teacherClasses;
}

    if (data.role === "student") {

      if (!studentClass || !studentBatch)
        throw new Error("Class and batch are required");

      data.class = Number(studentClass);
      data.batch = studentBatch.toUpperCase().trim();
      data.school = school;

      if (data.class >= 11) {
        data.stream = studentStream || null;
        data.optionalSubject = studentOptionalSubject || null;
      }
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


const findSchool = async () => {
  try {
    setLoading(true);

    const res = await Axios({
      ...SummaryAPi.getSchoolDetailsByUniqueId,
      data: { schoolId: school }
    });

    console.log(res);

    if (res.data?.success) {
      toast.success("School verified");

      setSchoolData(res.data.data.school);
      setCoreSubjects(res.data.data.coreSubject || []);
      setOptionalSubjects(res.data.data.school?.OptionalSubjects || []);
    }
  } catch (error) {
    toast.error("School not found");
    setSchoolData(null);
    setCoreSubjects([]);
    setOptionalSubjects([]);
  } finally {
    setLoading(false);
  }
};



  const handleAdd = () => {
      if (!current.class || !current.batch || !current.subject) {
    toast.error("Please fill all fields before adding");
    return;
  }

    // 🚫 DUPLICATE PREVENTION
  const exists = entries.some(
    e =>
      String(e.class) === String(current.class) &&
      String(e.batch) === String(current.batch) &&
      String(e.subject).toLowerCase() === String(current.subject).toLowerCase()
  );

  if (exists) {
    toast.error("This entry already exists");
    return;
  }


  setEntries((prev) => [...prev, current]);

  // clear inputs
  setCurrent({ class: "", batch: "", subject: "" });
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
           {(role === "student" || role === "teacher") && (
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[220px]">
                <Input
                  label="School:"
                  placeholder="Enter your school name"
                  type="text"
                  {...register("school", { required: true })}
                  onChange={(e)=>setSchool(e.target.value)}
                  value={school}
                />
              </div>

              <button
                type="button"
                onClick={findSchool}
                className="px-4 py-2 h-[42px] rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition min-w-[120px]"
              >
                Verify
              </button>
            </div>
          )}


            {role === "teacher" && (
              // <Input label="Classes you are teaching" placeholder="e.g., A5Physics, B10Math" type="text" {...register("classInfo", { required: true })} />

              <>

              <input type="hidden" {...register("classInfo", { required: true })} />

              <div className="flex flex-wrap gap-2 mb-4">
  {entries.map((item, index) => (
    <div
      key={index}
      className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg"
    >
      <span className="text-sm">
        {item.class} • {item.batch} • {item.subject}
      </span>

      <button
        type="button"
        onClick={() =>
          setEntries(entries.filter((_, i) => i !== index))
        }
        className="text-red-500 font-bold"
      >
        ×
      </button>
    </div>
  ))}
</div>
<div className="flex flex-wrap gap-3 items-end">

  {/* CLASS */}
<div className="min-w-[140px]">
  <label className="text-sm font-medium">Class</label>

  <select
    className="border rounded-lg px-3 py-2 w-full mt-1"
    value={current.class}
    onChange={(e) => {
      const selected = e.target.value;

      setCurrent({
        ...current,
        class: selected,
        batch: "",
        subject: ""
      });

      if (schoolData) {
        const classInfo = schoolData.classes.find(
          c => String(c.class) === String(selected)
        );
        setAvailableBatches(classInfo ? classInfo.batches : []);
      }

      setSubjectSearch("");
      setAvailableSubjects([]);
    }}
  >
    <option value="">Select</option>

    {schoolData?.classes?.map(c => (
      <option key={c.class} value={c.class}>
        {c.class}
      </option>
    ))}
  </select>
</div>


  {/* BATCH */}
<div className="min-w-[140px]">
  <label className="text-sm font-medium">Batch</label>

  <select
    className="border rounded-lg px-3 py-2 w-full mt-1"
    value={current.batch}
onChange={(e) => {
  const batch = e.target.value;
  const selectedClass = current.class;   // <-- freeze it

  setCurrent(prev => ({
    ...prev,
    batch,
    subject: ""
  }));

  // ⭐ get core subs for THIS class
  const core = coreSubjects.find(
    s => String(s.class) === String(selectedClass)
  );

  let subs = core ? core.subjects : [];

  // ⭐ add optional only for senior classes
  if (Number(selectedClass) >= 11 && core?.stream) {

    const opt = optionalSubjects.find(
      s => s.stream === core.stream
    );

    if (opt) subs = [...subs, ...opt.subjects];
  }

  setAvailableSubjects(subs);
  setSubjectSearch("");
}}

    disabled={!availableBatches.length}
  >
    <option value="">Select</option>

    {availableBatches.map(b => (
      <option key={b}>{b}</option>
    ))}
  </select>
</div>

  {/* SUBJECT */}
  <div className="min-w-[180px]">
    <label className="text-sm font-medium">Subject</label>

    <input
      placeholder="Search subject..."
      className="border rounded-lg px-3 py-1 mt-1 w-full"
      value={subjectSearch}
      onChange={e => setSubjectSearch(e.target.value)}
      disabled={!availableSubjects.length}
    />

    <select
      className="border rounded-lg px-3 py-2 w-full mt-1"
      value={current.subject}
      onChange={(e) =>
        setCurrent({ ...current, subject: e.target.value })
      }
      disabled={!availableSubjects.length}
    >
      <option value="">Select</option>

      {availableSubjects
        .filter(s =>
          s.toLowerCase().includes(subjectSearch.toLowerCase())
        )
        .map(s => (
          <option key={s}>{s}</option>
        ))}
    </select>
  </div>

  {/* ADD button */}
  <button
    type="button"
    className="h-10 px-4 bg-black text-white rounded-lg"
    onClick={handleAdd}
  >
    Add
  </button>
</div>


</>
            )}


{role === "student" && (
  <div className="space-y-4">

    {/* CLASS */}
    <div>
      <label className="text-sm font-medium">Class</label>
      <select
        className="border rounded-lg px-3 py-2 w-full mt-1"
        value={studentClass}
        onChange={e => {
          const value = e.target.value;
          setStudentClass(value);
          setStudentBatch("");
          setStudentStream("");
          setStudentOptionalSubject("");

          // set batches
          const c = schoolData?.classes?.find(
            x => String(x.class) === String(value)
          );
          setAvailableBatches(c ? c.batches : []);
        }}
        disabled={!schoolData}
      >
        <option value="">Select Class</option>

        {schoolData?.classes?.map(c => (
          <option key={c.class} value={c.class}>
            {c.class}
          </option>
        ))}

      </select>
    </div>

    {/* BATCH */}
    <div>
      <label className="text-sm font-medium">Batch</label>
      <select
        className="border rounded-lg px-3 py-2 w-full mt-1"
        value={studentBatch}
        onChange={e => setStudentBatch(e.target.value.toUpperCase())}
        disabled={!availableBatches.length}
      >
        <option value="">Select Batch</option>

        {availableBatches.map(b => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
    </div>


    {/* STREAM — ONLY IF CLASS >= 11 */}
    {Number(studentClass) >= 11 && (
      <div>
        <label className="text-sm font-medium">Stream</label>
        <select
          className="border rounded-lg px-3 py-2 w-full mt-1"
          value={studentStream}
          onChange={e => {
            setStudentStream(e.target.value);
            setStudentOptionalSubject("");
          }}
        >
          <option value="">Select Stream</option>

          {[...new Set(coreSubjects
            .filter(s => Number(s.class) === Number(studentClass))
            .map(s => s.stream)
          )].map(stream => (
            <option key={stream} value={stream}>{stream}</option>
          ))}

        </select>
      </div>
    )}


    {/* OPTIONAL SUBJECT — ONLY IF STREAM SELECTED */}
    {Number(studentClass) >= 11 && studentStream && (
      <div>
        <label className="text-sm font-medium">Optional Subject</label>

        <select
          className="border rounded-lg px-3 py-2 w-full mt-1"
          value={studentOptionalSubject}
          onChange={e => setStudentOptionalSubject(e.target.value)}
        >
          <option value="">Select Optional Subject</option>

          {(optionalSubjects.find(
            s => s.stream === studentStream
          )?.subjects || []).map(sub => (
            <option key={sub}>{sub}</option>
          ))}

        </select>
      </div>
    )}

  </div>
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

      {/* SCHOOL REGISTER FORM */}
      {registerType === "school" && <SchoolSignup />}

    </div>
  );
}

export default Signup;
