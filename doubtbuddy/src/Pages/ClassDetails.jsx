import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Axios from "../Utils/Axios";
import { useNavigate, useParams } from "react-router-dom";
import SummaryAPi from "../Common/SummaryApi";
import { useSelector } from "react-redux";

export default function ClassPage() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openBatch, setOpenBatch] = useState(null);

  const school = useSelector((state) => state.auth.userData);

  const { Class } = useParams();
  const navigate = useNavigate();

  // ================= FETCH STUDENTS =================
  const getStudents = async () => {
    try {
      const response = await Axios({
        ...SummaryAPi.studentsBySchoolClass,
        data: { Class },
      });

      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      setError("Error while fetching students");
    }
  };

  // ================= FETCH TEACHERS =================
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
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getStudents(), getTeachers()]).finally(() =>
      setLoading(false)
    );
  }, [Class]);

  // ================= GET BATCHES FROM SCHOOL (SOURCE OF TRUTH) =================
  const batches = useMemo(() => {
    if (!school?.classes) return [];

    const classObj = school.classes.find(
      (cls) => cls.class == Class
    );

    return classObj?.batches || [];
  }, [school, Class]);

  // ================= GROUP STUDENTS =================
  const studentsByBatch = useMemo(() => {
    return batches.reduce((acc, batch) => {
      acc[batch] = students.filter((s) => s.batch === batch);
      return acc;
    }, {});
  }, [batches, students]);

  // ================= GROUP TEACHERS =================
  const teachersByBatch = useMemo(() => {
    return batches.reduce((acc, batch) => {
      acc[batch] = teachers.filter((teacher) =>
        teacher.teacherClasses?.some(
          (tc) => tc.class == Class && tc.batch === batch
        )
      );
      return acc;
    }, {});
  }, [batches, teachers, Class]);

  // ================= UI STATES =================
  if (loading)
    return <div className="p-6 text-gray-600">Loading class data...</div>;

  if (error)
    return <div className="p-6 text-red-500">{error}</div>;

  // ================= MAIN UI =================
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Class {Class}</h1>

      {batches.length === 0 && (
        <p className="text-gray-500">No batches configured for this class.</p>
      )}

      {batches.map((batch) => (
        <div key={batch} className="bg-white rounded-2xl shadow-md">

          {/* ===== Batch Tile ===== */}
          <div
            onClick={() =>
              setOpenBatch(openBatch === batch ? null : batch)
            }
            className="cursor-pointer p-5 flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">
                Batch {batch}
              </h2>
              <p className="text-sm text-gray-500">
                {studentsByBatch[batch]?.length || 0} Students •{" "}
                {teachersByBatch[batch]?.length || 0} Teachers
              </p>
            </div>

            <span className="text-lg font-bold">
              {openBatch === batch ? "▲" : "▼"}
            </span>
          </div>

          {/* ===== Dropdown ===== */}
          {openBatch === batch && (
            <div className="border-t p-5 space-y-8">

              {/* ===== Teachers Section ===== */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Teachers
                </h3>

                {teachersByBatch[batch]?.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teachersByBatch[batch].map((teacher) => (
                      <motion.div
                        key={teacher._id}
                        whileHover={{ scale: 1.03 }}
                        onClick={() =>
                          navigate(`/school-user/${teacher._id}`)
                        }
                        className="cursor-pointer"
                      >
                        <div className="bg-blue-50 rounded-xl p-4 flex gap-4 items-center">
                          <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center font-bold">
                            {teacher.fullname?.[0]}
                          </div>
                          <div>
                            <p className="font-medium">
                              {teacher.fullname}
                            </p>
                            <p className="text-sm text-gray-500">
                              {teacher.email}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    No teachers assigned to this batch.
                  </p>
                )}
              </div>

              {/* ===== Students Section ===== */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Students
                </h3>

                {studentsByBatch[batch]?.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studentsByBatch[batch].map((student) => (
                      <motion.div
                        key={student._id}
                        whileHover={{ scale: 1.03 }}
                        onClick={() =>
                          navigate(`/school-user/${student._id}`)
                        }
                        className="cursor-pointer"
                      >
                        <div className="bg-gray-100 rounded-xl p-4 flex gap-4 items-center">
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center font-bold">
                            {student.fullname?.[0]}
                          </div>
                          <div>
                            <p className="font-medium">
                              {student.fullname}
                            </p>
                            <p className="text-sm text-gray-500">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    No students in this batch.
                  </p>
                )}
              </div>

            </div>
          )}
        </div>
      ))}
    </div>
  );
}