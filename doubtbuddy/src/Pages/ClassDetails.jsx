import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Axios from "../Utils/Axios";
import { useNavigate, useParams } from "react-router-dom";
import SummaryAPi from "../Common/SummaryApi";

export default function ClassPage() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { Class } = useParams();
  const navigate = useNavigate()

  // Fetch students
  const getStudents = async () => {
    try {
      const response = await Axios({
        ...SummaryAPi.studentsBySchoolClass,
        data: { Class },
      });
      if (response.data.success) {
        // Sort students by batch then fullname
        const sorted = response.data.data.sort((a, b) => {
          if (a.batch < b.batch) return -1;
          if (a.batch > b.batch) return 1;
          return a.fullname.localeCompare(b.fullname);
        });
        setStudents(sorted);
      }
    } catch (err) {
      setError("Error while fetching students");
      console.error(err);
    }
  };

  // Fetch teachers
  const getTeachers = async () => {
    try {
      const response = await Axios({
        ...SummaryAPi.TeachersBySchoolClass,
        data: { Class },
      });
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (err) {
      setError("Error while fetching teachers");
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getStudents(), getTeachers()]).finally(() =>
      setLoading(false)
    );
  }, [Class]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading class data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Teachers Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Teachers</h2>
        {teachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <motion.div key={teacher._id} whileHover={{ scale: 1.02 }} onClick={()=>navigate(`/school-user/${teacher._id}`)}>
                <div className="bg-white shadow-lg rounded-2xl p-4 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                    {teacher.fullname?.[0]}
                  </div>
                  <div>
                    <p className="text-lg font-medium">{teacher.fullname}</p>
                    <p className="text-gray-500 text-sm">{teacher.email}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No teacher found for this class.</p>
        )}
      </section>

      {/* Students Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Students</h2>
        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <motion.div key={student._id} whileHover={{ scale: 1.02 }} onClick={()=>navigate(`/school-user/${student._id}`)}>
                <div className="bg-white shadow-md rounded-2xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
                    {student.fullname?.[0]}
                  </div>
                  <div>
                    <p className="font-medium">{student.fullname}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <p className="text-sm text-gray-500">
                      Batch: {student.batch}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No students found for this class.</p>
        )}
      </section>
    </div>
  );
}
