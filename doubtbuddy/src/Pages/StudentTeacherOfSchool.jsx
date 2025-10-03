import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../Utils/Axios";
import SummaryAPi from "../Common/SummaryApi";
import jsPDF from "jspdf";

export default function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getUser = async () => {
    try {
      const response = await Axios({
        ...SummaryAPi.getUserProfileForSchool,
        url: `${SummaryAPi.getUserProfileForSchool.url}/${userId}`,
      });

      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setError("User not found");
      }
    } catch (err) {
      setError("Error fetching user profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, [userId]);

  const generateReportCard = () => {
    if (!user || user.role !== "student") return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Student Report Card", 105, 20, { align: "center" });

    // Student Info
    doc.setFontSize(12);
    doc.text(`Name: ${user.fullname}`, 20, 40);
    doc.text(`Class: ${user.class}`, 20, 50);
    doc.text(`Batch: ${user.batch}`, 20, 60);

    // Questions
    doc.setFontSize(14);
    doc.text("Doubts Asked:", 20, 80);
    doc.setFontSize(11);

    if (user.AskedQuestions?.length > 0) {
      user.AskedQuestions.forEach((q, idx) => {
        const y = 90 + idx * 10;
        doc.text(`${idx + 1}. ${q.title} - ${q.description}`, 20, y);
      });
    } else {
      doc.text("No doubts asked.", 20, 90);
    }

    doc.save(`${user.fullname}_ReportCard.pdf`);
  };

  if (loading) return <p className="p-6">Loading profile...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!user) return <p className="p-6">No profile found</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 flex gap-6 items-center">
        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
          {user.fullname?.[0]}
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{user.fullname}</h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-600 capitalize">Role: {user.role}</p>
          {user.role === "student" && (
            <>
              <p className="text-sm">Class: {user.class}</p>
              <p className="text-sm">Batch: {user.batch}</p>
              {user.stream && <p className="text-sm">Stream: {user.stream}</p>}
            </>
          )}
        </div>
      </div>

      {/* Extra Info */}
      <div className="mt-6">
        {user.role === "student" && (
          <>
            <h3 className="text-lg font-semibold mb-2">Performance</h3>
            <p className="text-gray-700">
              Questions Asked: <span className="font-medium">{user.AskedQuestions?.length || 0}</span>
            </p>
            <p className="text-gray-700">
              Questions Answered:{" "}
              <span className="font-medium">
                {user.AskedQuestions?.filter((q) => q.answered).length || 0}
              </span>
            </p>
            <button
              onClick={generateReportCard}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Download Report Card
            </button>
          </>
        )}

        {user.role === "teacher" && (
          <>
            <h3 className="text-lg font-semibold mb-2">Performance</h3>
            <p className="text-gray-700">
              Questions Answered:{" "}
              <span className="font-medium">{user.answeredQuestions?.length || 0}</span>
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">Classes Taught</h3>
            {user.teacherClasses?.length > 0 ? (
              <ul className="list-disc pl-6 space-y-1">
                {user.teacherClasses.map((c, idx) => (
                  <li key={idx}>
                    Class {c.class} – {c.subject} (Batch {c.batch})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No classes assigned.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
