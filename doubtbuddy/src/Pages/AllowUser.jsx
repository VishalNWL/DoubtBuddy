import React, { useEffect, useState } from 'react'
import Axios from '../Utils/Axios'
import SummaryAPi from '../Common/SummaryApi'
import { Link } from 'react-router-dom'
import { TiTick } from "react-icons/ti";
import { IoMdClose } from "react-icons/io";
import toast from 'react-hot-toast';
function AllowUser() {
    const [pendingUsers, setPendingUsers] = useState([])
  const getpendinguser = async()=>{
    try {
        const users = await Axios({
            ...SummaryAPi.pendingUser
        })

        console.log(users)
        setPendingUsers(users.data.data);
    } catch (error) {
        console.log(error)
    }
  }

  useEffect(()=>{
    getpendinguser();
  },[])

  const handlestatus =async (id,status)=>{
      if(!id || !status){
        return;
      }

      const response = await Axios({
        ...SummaryAPi.changestatus,
        data:{
            Id:id,
            status:status
        }
      })

      if(response.data.success){
          toast.success("Status Changed Successfully")
          getpendinguser();
      }
  }

  return (
 <div className='w-full'>
               <div className=' mt-5 flex justify-center items-center flex-col'>
        
               <div className='w-full px-5'>
                  {pendingUsers && pendingUsers.map(e => (
                
                    <li className='w-full bg-blue-100 hover:bg-blue-200  min-h-20 rounded-2xl list-none p-2 mt-5 shadow-md shadow-gray-400'>
                      <div className='lg:grid lg:grid-cols-5 pt-2 flex flex-col'>
                        <span><h1 className='ml-2 p-2 line-clamp-2 lg:line-clamp-3'><b>Name: </b>{e.fullname}</h1></span>
                        <span><h1 className='ml-2 p-2 line-clamp-2 lg:line-clamp-3'><b>Email: </b>{e.email}</h1></span>
                        <span><h1 className='ml-2 p-2 line-clamp-2 lg:line-clamp-3'><b>Role: </b>{e.role}</h1></span>
                        <span><h1 className='ml-2 p-2 line-clamp-2 lg:line-clamp-3'><b>School: </b>{e.school}</h1></span>
                        <span className='mr-5 flex gap-2 justify-around lg:justify-self-end'>
                          <button onClick={(event)=>{event.preventDefault();event.stopPropagation();handlestatus(e._id,'active');}} className={`border border-slate-400 text-slate-600 p-2 rounded-full hover:bg-green-400 hover:text-white `}><TiTick/></button>
                          <button onClick={(event)=>{event.preventDefault();event.stopPropagation();handlestatus(e._id , 'rejected');}} className='border border-slate-400 text-slate-600 p-2 rounded-full hover:bg-red-400 hover:text-white'><IoMdClose/></button>
                          </span>
                      </div>
                      
                     
                    </li>
                
                ))}
               </div>
        
                {
                  pendingUsers.length === 0 &&
                  <div className='mt-10'>
                    No Request found
                  </div>
                }
              </div>
             </div>
    
  )
}

export default AllowUser