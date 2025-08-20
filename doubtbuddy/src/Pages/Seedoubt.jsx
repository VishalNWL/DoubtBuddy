import React, { useEffect, useState } from 'react'
import HeaderStudent from '../Components/HeaderStudent'
import { useParams } from 'react-router-dom'
import { BiMessageCheck } from 'react-icons/bi'; // Font Awesome
import { FaPaperclip, FaClock } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import Axios from '../Utils/Axios';
import SummaryAPi from '../Common/SummaryApi';

dayjs.extend(relativeTime);

function Seedoubt() {
  const { id } = useParams();
  const [doubt, setdoubt] = useState({});
  const [issolved, setissolved] = useState(false);
  const [teacherName,setTeacherName]=useState("");
  const greentick = { 'unanswered': 'hidden', 'answered': 'inline-block' };

  useEffect(() => {
    (async () => {
      const dbt = await Axios({
        ...SummaryAPi.doubtbyId,
        data: { doubtId: id }
      });
      

      if (!dbt.data.success) {
        throw new Error('Doubt not found');
      }
      setdoubt(dbt.data.data);
     
      if (dbt.data.success) {
        const teacher = await Axios({
          ...SummaryAPi.userDetailsById,
          data:{ID:dbt.data.data.answeredBy}
        })
        console.log(teacher)
        setTeacherName(teacher.data.data.fullname)
        setissolved(true);
      }
    })();
  }, [id])


  const handleanswerClick = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  const handledoubtClick = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };




  return (
    <>
      <div className='w-full px-2 rounded'>
        <div className='bg-blue-100 mt-2 px-2 rounded'>
          <h1 className='p-1'><b>Subject: </b>{doubt.subject}</h1>
          <hr />
          <h1 className='p-1'><b>Status: </b>{doubt.status}<BiMessageCheck className={`text-green-500 text-xl inline-block ml-2 ${greentick[doubt.status]}`} title="Answered" /></h1>
        </div>

        <div className='mt-4 bg-blue-100 p-2 rounded'>
          <h1><b>Title: </b>{doubt.title}</h1>
          <hr />
          {doubt.questionDescription && <h1><b>Description: </b>{doubt.questionDescription}</h1>}
        </div>

        {doubt.questionFile && <div className='w-full'>
          <h1 className='bg-blue-600 inline-block p-2 rounded-md mt-3 text-white cursor-pointer' onClick={() => handledoubtClick(doubt.questionFile)}>Question File <FaPaperclip className='inline-block text-white' /></h1>
        </div>}

        <hr className='mt-4 p-2 rounded' />
        {issolved && <>
          <div className='flex justify-between'>
            <span><b>Answered By: </b>{teacherName}</span>
            <span><FaClock className='inline-block mr-2 text-gray-500' />{dayjs(doubt.updatedAt).fromNow()}</span>
          </div>

          <div className='mt-4 bg-gray-400 p-2 px-3 rounded'>
            <h1><b>Answer: </b>{doubt.answerText}</h1>

          </div>
          {(doubt.answerPhoto || doubt.answerVideo) && <div className='w-full cursor-pointer'>
            <h1 className='bg-blue-600 inline-block p-2 rounded-md mt-3 text-white' onClick={()=>{handleanswerClick(doubt.answerPhoto || doubt.answerVideo)}}>See Attachment <FaPaperclip className='inline-block text-white' /></h1>
          </div>}

        </>
        }
      </div>
    </>
  )
}

export default Seedoubt