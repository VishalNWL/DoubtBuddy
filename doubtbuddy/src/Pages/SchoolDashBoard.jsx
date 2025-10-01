
  import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const COLORS = [
  "from-gray-100 to-gray-300",
  "from-blue-100 to-blue-300",
  "from-green-100 to-green-300",
  "from-purple-100 to-purple-300",
  "from-indigo-100 to-indigo-300",
  "from-teal-100 to-teal-300",
  "from-yellow-100 to-yellow-300",
  "from-pink-100 to-pink-300",
];

function SchoolDashBoard() {
  const school = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();

  const handleCardClick = (cls) => {
    navigate(`/class-details/${cls}`);
  };

  if (!school?.classes?.length) {
    return <p className="text-center mt-10 text-lg">No classes available</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Welcome to {school.schoolName}
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Select a class to view doubts and activities
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {school.classes.map((cls, index) => (
          <div
            key={cls}
            onClick={() => handleCardClick(cls)}
            className={`
              relative cursor-pointer rounded-lg p-8 text-center font-semibold text-xl 
              bg-gradient-to-br ${COLORS[index % COLORS.length]} 
              shadow-md transition-transform transform hover:scale-105 hover:shadow-xl
              overflow-hidden
            `}
          >
            {/* Reflection overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 blur-xl rotate-12 pointer-events-none"></div>

            {/* Card content */}
            <div className="relative z-10">
              Class {cls}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SchoolDashBoard;
