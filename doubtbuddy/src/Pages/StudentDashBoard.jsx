import React from 'react'
import HeaderStudent from '../Components/HeaderStudent'
import { useState,useEffect } from 'react';
import { useSelector } from 'react-redux';
import {Button, Select} from '../Components/index.js'
import { FaSearch } from 'react-icons/fa';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import { Link } from 'react-router-dom';
import { BiMessageCheck  } from 'react-icons/bi'; // Font Awesome
import { AiOutlinePlusCircle } from 'react-icons/ai';
import Axios from '../Utils/Axios.js';
import SummaryAPi from '../Common/SummaryApi.js';

dayjs.extend(relativeTime);

function StudentDashBoard() {
  const [answereddoubt,setanswerddbt]=useState(0);
  const [pendingdoubt,setpendingdoubt]=useState(0);
  const [doubts, setdoubts]=useState([]);
  const [subject, setsubject]=useState([]);
  const [choosensubject,setchoosensubject]=useState('');
  const [showdoubts,setshowdoubts]=useState([]);
  const user=useSelector((state)=>state.auth).userData;

  const greentick = {'unanswered':'hidden','answered':'inline-block'};

 const fetchdoubts=async()=>{
   try {
            const totaldoubt= await Axios({
              ...SummaryAPi.totalStudentDoubt,
              data:{studentId:user._id}
            })

          if(!totaldoubt.data.success){
            throw new Error(`Request failed`)
          }
        
          setdoubts(totaldoubt.data.data);
          let answereddbt=0;
          let unanswereddoubt=0;
           totaldoubt.data.data.forEach(e => {
               if(e.status==='answered'){
                 answereddbt++;
               }
               if(e.status==="unanswered"){
                 unanswereddoubt++;
               }
           })
  
          setanswerddbt(answereddbt);
          setpendingdoubt(unanswereddoubt);
           
         let subjects=await Axios({
          ...SummaryAPi.getSubject,
           data:{Class:user.class}
         })

           if(!subjects.data.success){
            throw new Error(`Request failed`)
          }
          
          subjects=await subjects.data.data;
          setsubject(subjects)

    } catch (error) {
        console.log(error.message);
    }
 }

  useEffect(()=>{
     fetchdoubts();
},[])

const handlesearch = ()=>{
  if(choosensubject==='') return;
     
  if(choosensubject==='All') {
    setshowdoubts(doubts);
    return;
  }
   setshowdoubts(doubts.filter(e=> e.subject === choosensubject));
}


const handleDelete = async(id)=>{
    try {
      const deleteRef = await Axios({
        ...SummaryAPi.deleteDoubtById,
        data:{doubtid:id}
      })

       if(deleteRef.data.success){

         fetchdoubts();
       }

    } catch (error) {
      console.log(error)
    }
}

useEffect(()=>{
  if(choosensubject==='') return;
   

  if(choosensubject==='All') {
    setshowdoubts(doubts);
    return;
  }
   setshowdoubts(doubts.filter(e=> e.subject === choosensubject));
},[choosensubject,doubts])

  return (
    <>
     
     <div className='flex gap-4 w-full justify-center mt-4'>
    <span>
        <Select
       placeholder={choosensubject||"Subject"}
       options={[...subject,'All']}
       value={choosensubject}
       onChange={(e)=>{
            setchoosensubject(e.target.value);
       }}
       className="w-40"
     />
    </span>

    <Button onClick={handlesearch}><FaSearch/></Button>
     </div>

<div className='flex justify-center mt-4'>
  <Link className='bg-gray-300 p-2 rounded-md w-[43%] pl-4 hover:bg-gray-400 flex items-center justify-between ' 
   to={`/askdoubt`}
  >
  Ask
  <AiOutlinePlusCircle className='inline-block text-gray-500'/>
  </Link>
</div>


     <div className='w-full'>
       <div className=' mt-5 flex justify-center items-center flex-col'>

       <div className='w-full px-5'>
          {showdoubts && showdoubts.map(e => (
          <Link key={e._id} to={{
            pathname: `/seedoubt/${e._id}`,
          }}>
            <li className='w-full bg-blue-100 hover:bg-blue-200  min-h-20 rounded-2xl list-none p-2 mt-5 shadow-md shadow-gray-400'>
              <div className='flex items-center justify-between'>
                <span><h1 className='ml-2 p-2'><b>Title:</b>{e.title}</h1></span>
                <span className='mr-5'>
                  <button onClick={(event)=>{event.preventDefault();event.stopPropagation();handleDelete(e._id);}} className='border border-black px-2 rounded hover:bg-red-300'>Delete</button>
                  </span>
              </div>
              
              <h1 className=' ml-2 p-2'><b>Status: </b>{e.status}<BiMessageCheck  className={`text-green-500 text-xl inline-block ml-2 ${greentick[e.status]}`} title="Answered" /></h1>
             
            </li>
           </Link>
        ))}
       </div>

        {
          showdoubts.length === 0 &&
          <div className='mt-10'>
            No doubts
          </div>
        }
      </div>
     </div>
    </>
  )
}

export default StudentDashBoard