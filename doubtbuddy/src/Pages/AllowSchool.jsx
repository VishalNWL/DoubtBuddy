import React, { useEffect, useState } from "react";
import Axios from "../Utils/Axios";
import SummaryAPi from "../Common/SummaryApi";
import { TiTick } from "react-icons/ti";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";

function AllowSchool() {

  const [pendingSchools, setPendingSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const getPendingSchool = async () => {
    try {
      const schools = await Axios({ ...SummaryAPi.pendingSchool });
      setPendingSchools(schools.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => { getPendingSchool(); }, []);

  const handleStatus = async (id, status) => {
    if (!id || !status) return;

    const response = await Axios({
      ...SummaryAPi.schoolStatus,
      data: { Id:id, status }
    });

    if (response.data.success) {
      toast.success("School Status Updated");
      setOpenModal(false);
      getPendingSchool();
    }
  };

  return (
<div className="w-full">

  {/* ===== List ===== */}
  <div className="mt-5 flex justify-center items-center flex-col w-full px-5">

    {pendingSchools?.map(school => (
      <li
        key={school._id}
        className="w-full bg-green-100 hover:bg-green-200 min-h-20 rounded-2xl list-none p-2 mt-5 shadow-md shadow-gray-400 cursor-pointer"
        onClick={()=>{ setSelectedSchool(school); setOpenModal(true); }}
      >
        <div className="lg:grid lg:grid-cols-5 flex flex-col gap-2">

          <span><b>School Name:</b> {school.schoolName}</span>
          <span><b>Contact No:</b> {school.contactNo}</span>
          <span><b>Address:</b> {school.address}</span>
          <span><b>Country:</b> {school.country}</span>
          <span><b>ID:</b> {school.schoolId}</span>

          <span className="flex gap-2 justify-end">
            <button
              onClick={(e)=>{e.stopPropagation();handleStatus(school._id,"active")}}
              className="border p-2 rounded-full hover:bg-green-400 hover:text-white"
            ><TiTick/></button>

            <button
              onClick={(e)=>{e.stopPropagation();handleStatus(school._id,"rejected")}}
              className="border p-2 rounded-full hover:bg-red-400 hover:text-white"
            ><IoMdClose/></button>
          </span>

        </div>
      </li>
    ))}

    {pendingSchools.length===0 && <div className="mt-10">No School Requests</div>}
  </div>


  {/* ===== Modal ===== */}
  {openModal && selectedSchool && (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-xl shadow-xl relative">

        {/* Close */}
        <button
          onClick={()=>setOpenModal(false)}
          className="absolute top-3 right-3 text-xl"
        >✖</button>

        <h2 className="text-2xl font-bold text-center mb-4">
          School Details
        </h2>

        <div className="space-y-2">

          <p><b>School Name:</b> {selectedSchool.schoolName || "N/A"}</p>
          <p><b>Email:</b> {selectedSchool.email || "N/A"}</p>
          <p><b>Contact No:</b> {selectedSchool.contactNo || "N/A"}</p>
          <p><b>Address:</b> {selectedSchool.address || "N/A"}</p>
          <p><b>Pincode:</b> {selectedSchool.pincode || "N/A"}</p>
          <p><b>Country:</b> {selectedSchool.country || "N/A"}</p>
          <p><b>Location:</b> {selectedSchool.location || "N/A"}</p>
          <p><b>School ID:</b> {selectedSchool.schoolId || "N/A"}</p>
          <p><b>Status:</b> {selectedSchool.status}</p>
          <p><b>Created:</b> {new Date(selectedSchool.createdAt).toLocaleString()}</p>

          {/* ⭐ CLASSES ⭐ */}
          <div className="mt-3">
            <b>Classes:</b>
            {selectedSchool?.classes?.length ? (
              <ul className="ml-4 list-disc">
                {selectedSchool.classes.map((c,i)=>(
                  <li key={i}>
                    Class {c.class} — Batches: {c.batches?.join(", ") || "None"}
                  </li>
                ))}
              </ul>
            ) : " N/A"}
          </div>

          {/* ⭐ OPTIONAL SUBJECTS ⭐ */}
          <div className="mt-3">
            <b>Optional Subjects:</b>
            {selectedSchool?.OptionalSubjects?.length ? (
              <ul className="ml-4 list-disc">
                {selectedSchool.OptionalSubjects.map((o,i)=>(
                  <li key={i}>
                    {o.stream}: {o.subjects?.join(", ")}
                  </li>
                ))}
              </ul>
            ) : " N/A"}
          </div>

        </div>

        <div className="flex justify-around mt-6">
          <button
            onClick={()=>handleStatus(selectedSchool._id,"active")}
            className="bg-green-500 px-4 py-2 rounded-lg text-white flex gap-1 items-center"
          >
            <TiTick/> Approve
          </button>

          <button
            onClick={()=>handleStatus(selectedSchool._id,"rejected")}
            className="bg-red-500 px-4 py-2 rounded-lg text-white flex gap-1 items-center"
          >
            <IoMdClose/> Reject
          </button>
        </div>

      </div>
    </div>
  )}

</div>
  );
}

export default AllowSchool;
