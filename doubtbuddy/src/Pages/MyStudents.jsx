import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function MyStudents() {

  const user = useSelector((state) => state.auth).userData;
  const navigate = useNavigate();

  const teacherClasses = user?.teacherClasses || [];

  // Convert into class -> batches
  const grouped = {};

  teacherClasses.forEach(({ class: cls, batch }) => {
    if (!grouped[cls]) grouped[cls] = [];
    if (!grouped[cls].includes(batch)) {
      grouped[cls].push(batch);
    }
  });

  const handleBatchClick = (cls, batch) => {
    navigate(`/my-batch-students/${cls}/${batch}`);
  };

  return (
    <div className="p-4 md:p-8">

      <h1 className="text-2xl font-bold mb-6">
        My Classes
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {Object.entries(grouped).map(([cls, batches]) => {
          return (
            <div
              key={cls}
              className="bg-white shadow-lg rounded-xl p-5 border hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold mb-4">
                Class {cls}
              </h2>

              {/* Batches */}
              <div className="flex flex-wrap gap-2">
                {batches.map((batch) => (
                  <button
                    key={batch}
                    onClick={() => handleBatchClick(cls, batch)}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm"
                  >
                    Batch {batch}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}

export default MyStudents;