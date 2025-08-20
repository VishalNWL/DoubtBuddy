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

dayjs.extend(relativeTime);

function TeacherDashBoard() {
  const { register, handleSubmit } = useForm();
  const [Classes, setClasses] = useState({});
  const [alldoubt, setalldoubt] = useState([]);
  const [error, seterror] = useState('');
  const user = useSelector(state=>state.auth).userData


 const fetchData= async () => {
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
        data:data
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
          <Select
            placeholder='Class'
            className={'bg-gray-300'}
           
            options={Classes.Classoptions}
            
            {...register("Class",
              {
                required: ["Class is required"]
              })}
          />

          <Select
         
            className={'bg-gray-300'}
            placeholder='Batch'
         
            options={Classes.Batchoptions}

            {...register("batch",
              {
                required: ['Batch is required']
              })}
          />
          <Select
            className="bg-gray-300"
            placeholder='Subject'
            
            options={Classes.Subjectoptions}

            {...register("subject",
              {
                required: ["Subject is required"]
              })}
          />
          <Button type='submit'><FaSearch /></Button>
        </form>
      </div>

      <div className=' mt-5 flex justify-center items-center flex-col'>

        {alldoubt && alldoubt.map(e => (
         <div className='w-full'>
           <Link key={e._id} to={{
            pathname: `/solvedoubt/${e._id}/${user._id}`,
            search: `?student=${e.studentname}&title=${encodeURIComponent(e.title)}`
          }}>
            <li className='w-full bg-gray-400 hover:bg-gray-600 min-h-20 rounded list-none p-2 mt-5'>
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
            No doubts
          </div>
        }
      </div>
    </>
  )
}

export default TeacherDashBoard