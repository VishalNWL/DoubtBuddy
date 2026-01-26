import React, { useEffect, useState } from 'react'
import Header from '../Components/HeaderTeacher'
import { useForm } from 'react-hook-form'
import { Input, Button, Select } from '../Components/index.js'
import { FaSearch } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Axios from '../Utils/Axios.js';
import SummaryAPi from '../Common/SummaryApi.js';
import NoData from '../Components/ui/Nodata.jsx';

dayjs.extend(relativeTime);

function TeacherDashBoard() {
  const { register, handleSubmit } = useForm();
  const [Classes, setClasses] = useState({});
  const [alldoubt, setalldoubt] = useState([]);
  const [error, seterror] = useState('');
  const user = useSelector(state => state.auth).userData
  const teacherClasses = user.teacherClasses || [];

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");


  const fetchData = async () => {
    try {


      const classinfo = user.teacherClasses;

      const classSet = new Set();
      const batchSet = new Set();
      const subjectSet = new Set();

      classinfo.forEach(entry => {
        classSet.add(entry.class);
        batchSet.add(entry.batch);
        subjectSet.add(entry.subject);
      });


      const Classoptions = Array.from(classSet);
      const Batchoptions = Array.from(batchSet);
      const Subjectoptions = Array.from(subjectSet);
      setClasses({ Classoptions, Batchoptions, Subjectoptions });

    } catch (err) {
      console.error('Error fetching user:', err);
    }

  }

  useEffect(() => {
    fetchData();
  }, []);


  const finddoubt = async (data) => {
    try {
      const response = await Axios({
        ...SummaryAPi.subjectTeacherDoubt,
        data: {
          Class:selectedClass,
          batch:selectedBatch,
          subject:selectedSubject,
          schoolId:user.school
        }
      })

      if (response.data.success) {
        setalldoubt(response.data.data);
      }
    } catch (error) {
      seterror(error.message);
    }
  }



  return (
    <>
      <div className='flex flex-col justify-center items-center'>
        <form onSubmit={handleSubmit(finddoubt)} className='flex gap-8 mt-5'>
<div className="w-full">
  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-stretch sm:items-end">

    {/* CLASS */}
    <div className="w-full sm:min-w-[140px] sm:flex-1">
      <label className="text-sm font-medium">Class</label>
      <select
        className="border rounded-lg px-3 py-2 w-full"
        value={selectedClass}
        onChange={(e) => {
          setSelectedClass(e.target.value);
          setSelectedBatch("");
          setSelectedSubject("");
        }}
      >
        <option value="">Select Class</option>
        {[...new Set(teacherClasses.map(tc => tc.class))].map(cls => (
          <option key={cls} value={cls}>{cls}</option>
        ))}
      </select>
    </div>

    {/* BATCH */}
    <div className="w-full sm:min-w-[140px] sm:flex-1">
      <label className="text-sm font-medium">Batch</label>
      <select
        className="border rounded-lg px-3 py-2 w-full"
        value={selectedBatch}
        disabled={!selectedClass}
        onChange={(e) => {
          setSelectedBatch(e.target.value);
          setSelectedSubject("");
        }}
      >
        <option value="">Select Batch</option>
        {[...new Set(
          teacherClasses
            .filter(tc => String(tc.class) === String(selectedClass))
            .map(tc => tc.batch)
        )].map(batch => (
          <option key={batch} value={batch}>{batch}</option>
        ))}
      </select>
    </div>

    {/* SUBJECT */}
    <div className="w-full sm:min-w-[180px] sm:flex-1">
      <label className="text-sm font-medium">Subject</label>
      <select
        className="border rounded-lg px-3 py-2 w-full"
        value={selectedSubject}
        disabled={!selectedBatch}
        onChange={(e) => setSelectedSubject(e.target.value)}
      >
        <option value="">Select Subject</option>
        {teacherClasses
          .filter(
            tc =>
              String(tc.class) === String(selectedClass) &&
              String(tc.batch) === String(selectedBatch)
          )
          .map(tc => (
            <option key={tc.subject} value={tc.subject}>
              {tc.subject}
            </option>
          ))}
      </select>
    </div>

    {/* SEARCH BUTTON */}
    <div className="w-full sm:w-auto">
      <button
        type="submit"
        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white flex justify-center items-center gap-2"
        disabled={!selectedClass || !selectedBatch || !selectedSubject}
      >
        <FaSearch />
        <span className="sm:hidden">Search</span>
      </button>
    </div>

  </div>
</div>


        </form>
      </div>

      <div className=' mt-5 flex justify-center items-center flex-col px-2'>

        {alldoubt && alldoubt.map(e => (
          <div className='w-full'>
            <Link key={e._id} to={{
              pathname: `/solvedoubt/${e._id}/${user._id}`,
              search: `?student=${e.studentname}&title=${encodeURIComponent(e.title)}`
            }}>
              <li className='w-full bg-blue-200 shadow shadow-gray-500 hover:bg-blue-300 min-h-20 rounded-lg list-none p-3 mt-5'>
                <div className='flex justify-between px-5'>
                  <span><b>Asked by:</b> {e.studentname}</span>
                  <span>{dayjs(e.createdAt).fromNow()}</span>
                </div>
                <h1 className='mt-2 ml-5'><b>Title:</b> {e.title}</h1>
              </li>
            </Link>
          </div>
        ))}

        {
          alldoubt.length === 0 &&
          <div className='mt-10'>
            <NoData />
          </div>
        }
      </div>
    </>
  )
}

export default TeacherDashBoard