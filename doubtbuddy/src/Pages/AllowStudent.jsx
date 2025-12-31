import React, { useEffect, useState } from 'react'
import Axios from '../Utils/Axios'
import SummaryAPi from '../Common/SummaryApi'
import { TiTick } from "react-icons/ti";
import { IoMdClose } from "react-icons/io";
import toast from 'react-hot-toast';

function AllowStudent() {

  const [pendingUsers, setPendingUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [openModal, setOpenModal] = useState(false)

  const getpendinguser = async()=>{
    try {
        const users = await Axios({ ...SummaryAPi.pendingStudent })
        setPendingUsers(users.data.data);
    } catch (error) { console.log(error) }
  }

  useEffect(()=>{ getpendinguser(); },[])

  const handlestatus = async (id,status)=>{
    if(!id || !status) return;

    const response = await Axios({
      ...SummaryAPi.changestatus,
      data:{ Id:id, status }
    })

    if(response.data.success){
      toast.success("Status Changed Successfully")
      setOpenModal(false)
      getpendinguser()
    }
  }

  return (
<div className='w-full'>
  <div className='mt-5 flex justify-center items-center flex-col w-full px-5'>

    {/* ---------- LIST ---------- */}
    {pendingUsers?.map(e => (
      <li
        key={e._id}
        className='w-full bg-blue-100 hover:bg-blue-200 min-h-20 rounded-2xl list-none p-2 mt-5 shadow-md shadow-gray-400 cursor-pointer'
        onClick={()=>{ setSelectedUser(e); setOpenModal(true); }}
      >
        <div className='lg:grid lg:grid-cols-5 pt-2 flex flex-col'>
          <span><b>Name:</b> {e.fullname}</span>
          <span><b>Email:</b> {e.email}</span>
          <span><b>Role:</b> {e.role}</span>
          <span><b>School:</b> {e.school}</span>

          <span className='mr-5 flex gap-2 justify-around lg:justify-self-end'>
            <button 
              onClick={(event)=>{event.stopPropagation();handlestatus(e._id,'active');}}
              className='border p-2 rounded-full hover:bg-green-400 hover:text-white'
            ><TiTick/></button>

            <button 
              onClick={(event)=>{event.stopPropagation();handlestatus(e._id,'rejected');}}
              className='border p-2 rounded-full hover:bg-red-400 hover:text-white'
            ><IoMdClose/></button>
          </span>
        </div>
      </li>
    ))}

    {pendingUsers.length===0 && <div className='mt-10'>No Request found</div>}
  </div>


  {/* ---------- MODAL ---------- */}
  {openModal && selectedUser && (
    <div className='fixed inset-0 bg-black/50 flex justify-center items-center z-50'>
      <div className='bg-white rounded-2xl p-6 w-[90%] max-w-lg shadow-xl relative'>

        <button 
          onClick={()=>setOpenModal(false)}
          className='absolute top-3 right-3 text-xl'
        >✖</button>

        <h2 className='text-2xl font-bold mb-4 text-center'>
          Student Details
        </h2>

        <div className='space-y-2'>
          <p><b>Name:</b> {selectedUser.fullname}</p>
          <p><b>Email:</b> {selectedUser.email}</p>
          <p><b>Username:</b> {selectedUser.username}</p>
          <p><b>Role:</b> {selectedUser.role}</p>
          <p><b>Status:</b> {selectedUser.status}</p>
          <p><b>School:</b> {selectedUser.school}</p>
          <p><b>Created:</b> {new Date(selectedUser.createdAt).toLocaleString()}</p>

          {/* ⭐ Student-Specific Fields ⭐ */}
          <p><b>Class:</b> {selectedUser.class}</p>
          <p><b>Batch:</b> {selectedUser.batch}</p>
          <p><b>Stream:</b> {selectedUser.stream || "N/A"}</p>
          <p><b>Optional Subject:</b> {selectedUser.optionalSubject || "N/A"}</p>
        </div>

        <div className='flex justify-around mt-6'>
          <button 
            onClick={()=>handlestatus(selectedUser._id,'active')}
            className='bg-green-500 px-4 py-2 rounded-lg text-white flex items-center gap-1'
          >
            <TiTick/> Approve
          </button>

          <button 
            onClick={()=>handlestatus(selectedUser._id,'rejected')}
            className='bg-red-500 px-4 py-2 rounded-lg text-white flex items-center gap-1'
          >
            <IoMdClose/> Reject
          </button>
        </div>

      </div>
    </div>
  )}

</div>
  )
}

export default AllowStudent
