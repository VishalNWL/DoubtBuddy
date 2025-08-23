import React, { useEffect, useState } from "react";
import Axios from "../Utils/Axios";
import SummaryAPi from "../Common/SummaryApi";
import { TiTick } from "react-icons/ti";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";

function AllowSchool() {
  const [pendingSchools, setPendingSchools] = useState([]);

  const getPendingSchool = async () => {
    try {
      const schools = await Axios({
        ...SummaryAPi.pendingSchool, // 🔹 API endpoint for pending schools
      });

      console.log(schools);
      setPendingSchools(schools.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPendingSchool();
  }, []);

  const handleStatus = async (id, status) => {
    if (!id || !status) {
      return;
    }

    const response = await Axios({
      ...SummaryAPi.schoolStatus, // 🔹 API endpoint for changing school status
      data: {
        Id: id,
        status: status,
      },
    });

    if (response.data.success) {
      toast.success("School Status Changed Successfully");
      getPendingSchool();
    }
  };

  return (
    <div className="w-full">
      <div className="mt-5 flex justify-center items-center flex-col">
        <div className="w-full px-5">
          {pendingSchools &&
            pendingSchools.map((school) => (
              <li
                key={school._id}
                className="w-full bg-green-100 hover:bg-green-200 min-h-20 rounded-2xl list-none p-2 mt-5 shadow-md shadow-gray-400"
              >
                <div className="lg:grid lg:grid-cols-5 pt-2 flex flex-col">
                  <span>
                    <h1 className="ml-2 p-2 line-clamp-2">
                      <b>Contact No: </b>
                      {school.schoolName}
                    </h1>
                  </span>
                  <span>
                    <h1 className="ml-2 p-2 line-clamp-2">
                      <b>School Name: </b>
                      {school.contactNo}
                    </h1>
                  </span>
                  <span>
                    <h1 className="ml-2 p-2 line-clamp-2">
                      <b>Address: </b>
                      {school.address}
                    </h1>
                  </span>
                  <span>
                    <h1 className="ml-2 p-2 line-clamp-2">
                      <b>Pincode: </b>
                      {school.pincode}
                    </h1>
                  </span>
                  <span>
                    <h1 className="ml-2 p-2 line-clamp-2">
                      <b>Country: </b>
                      {school.country}
                    </h1>
                  </span>
                  <span>
                    <h1 className="ml-2 p-2 line-clamp-2">
                      <b>School ID: </b>
                      {school.schoolId}
                    </h1>
                  </span>
                  <span className="mr-5 flex gap-2 justify-around lg:justify-self-end">
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleStatus(school._id, "active");
                      }}
                      className="border border-slate-400 text-slate-600 p-2 rounded-full hover:bg-green-400 hover:text-white"
                    >
                      <TiTick />
                    </button>
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleStatus(school._id, "rejected");
                      }}
                      className="border border-slate-400 text-slate-600 p-2 rounded-full hover:bg-red-400 hover:text-white"
                    >
                      <IoMdClose />
                    </button>
                  </span>
                </div>
              </li>
            ))}
        </div>

        {pendingSchools.length === 0 && (
          <div className="mt-10">No School Requests found</div>
        )}
      </div>
    </div>
  );
}

export default AllowSchool;
