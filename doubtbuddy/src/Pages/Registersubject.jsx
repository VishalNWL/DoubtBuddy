import React, { useEffect, useState } from "react";
import Axios from "../Utils/Axios";
import SummaryAPi from "../Common/SummaryApi";
import { Atom } from "react-loading-indicators";
import { useSelector } from "react-redux";

function SubjectRegister({ schoolData }) {
    const SchoolInfo = useSelector((state) => state.auth.userData);
 
  const school = SchoolInfo.schoolId;

 
  const [selectedClass, setSelectedClass] = useState("");
  const [stream, setStream] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [optionalSubjects, setOptionalSubjects] = useState([]);
  const [classExist,setClassExist] =useState(true);

  const [newSubject, setNewSubject] = useState("");
  const [newOptional, setNewOptional] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // useEffect(() => {
  //   if (schoolData?.OptionalSubjects?.length) {
  //     const merged = schoolData.OptionalSubjects.flatMap(s => s.subjects);
  //     setOptionalSubjects([...new Set(merged)]);
  //   }
  // }, [schoolData]);

  // useEffect(() => {
  //   const fetchClasses = async () => {
  //     try {
  //       const res = await Axios.get(`${SummaryAPi.getClasses}?school=${school}`);
  //       setClasses(res.data.data || []);
  //     } catch {}
  //   };
  //   if (school) fetchClasses();
  // }, [school]);

  useEffect(() => {
    if (!selectedClass) return;

    if(selectedClass>=11 && !stream) return;

    const fetchSubjects = async () => {
      try {
        setFetching(true);

       setClassExist(true);
        const res = await Axios({
          ...SummaryAPi.getSubject,
          data:{
            school:SchoolInfo.schoolId,
          Class: selectedClass,
          stream
          }
        });
        console.log("ehl " ,res)
        if(res.data.success){
          setClassExist(true);
        }
        console.log(res)
        setSubjects(res.data.data?.subjects || []);
        setNewSubject("");
      } catch(err) {
        setSubjects([]);
        if(err.response?.data?.message==='Class subjects not found'){
          setClassExist(false);
        }
        console.log(err)
      } finally {
        setFetching(false);
      }
    };

    if (selectedClass < 11 || stream) fetchSubjects();
  }, [selectedClass, stream, school]);

  const addSubject = () => {
    if (!newSubject.trim()) return;
    setSubjects(prev => [...new Set([...prev, newSubject.trim()])]);
    setNewSubject("");
  };

  const removeSubject = (idx) => {
    setSubjects(prev => prev.filter((_, i) => i !== idx));
  };


  const submit = async () => {
    if (!selectedClass) return alert("Select a class");
    if (selectedClass >= 11 && !stream) return alert("Select stream");
    if (!subjects.length) return alert("Add at least one subject");

    try {
      setLoading(true);
      let res;
     let OptionalSubjects = [];

      if(selectedClass >= 11){
        const streamData = SchoolInfo?.OptionalSubjects?.find(
          o => o.stream === stream
        );
        OptionalSubjects = streamData?.subjects || [];
      }

     if(classExist){
         res=   await Axios({
        ...SummaryAPi.UpdateSubject,
        data:{
        school:SchoolInfo.schoolId,
        Class: selectedClass,
        stream: selectedClass >= 11 ? stream : null,
        subjects,
        OptionalSubjects
        }
      });
     }
     else{
         res=   await Axios({
        ...SummaryAPi.registerSubject,
        data:{
        school:SchoolInfo.schoolId,
        Class: selectedClass,
        stream: selectedClass >= 11 ? stream : null,
        subjects,
        OptionalSubjects
        }
      });
     }

     console.log(res)
     setClassExist(true);

      alert("Subjects updated successfully");
    } catch {
      alert("Error updating subjects");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold">Manage Subjects</h2>

      <div className="mt-4">
        <label className="font-medium">Select Class</label>
        <select
          className="w-full border rounded px-3 py-2 mt-1"
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(Number(e.target.value));
            setStream("");
            setSubjects([]);
          }}
        >
          <option value="">Choose...</option>
          {SchoolInfo.classes.map(c => (
            <option key={c.class} value={c.class}>{c.class}</option>
          ))}
        </select>
      </div>

      {selectedClass >= 11 && (
        <div className="mt-3">
          <label className="font-medium">Stream</label>
          <select
            className="w-full border rounded px-3 py-2 mt-1"
            value={stream}
            onChange={(e) =>{
               setStream(e.target.value)
              }}

          >
            <option value="">Choose...</option>
            {SchoolInfo.OptionalSubjects.map(c => (
            <option key={c.stream} value={c.stream}>{c.stream}</option>
          ))}
          </select>
        </div>
      )}

      <div className="mt-5">
        <h3 className="font-semibold">Subjects (Core Subjects Only)</h3>

        {fetching ? (
          <p>Loading…</p>
        ) : (
          subjects.map((s, i) => (
            <div key={i} className="flex gap-2 mt-2">
              <input value={s} className="flex-1 border px-3 py-2 rounded" readOnly />
              <button className="bg-red-500 text-white px-3 rounded" onClick={() => removeSubject(i)}>✕</button>
            </div>
          ))
        )}

        <div className="flex gap-2 mt-3">
          <input
            value={newSubject}
            placeholder="Add subject"
            className="flex-1 border px-3 py-2 rounded"
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 rounded" onClick={addSubject}>+</button>
        </div>
      </div>

 {selectedClass >= 11 && (
  <div className="mt-6">
    <h3 className="font-semibold">Optional Subjects</h3>

    {/* Get the optional subjects for the selected stream */}
    {(() => {
      const streamData = SchoolInfo?.OptionalSubjects?.find(
        (o) => o.stream === stream
      );

      if (!streamData && !stream) {
        return (
          <p className="text-gray-500 mt-2">
            No optional subjects available for this stream.
          </p>
        );
      }

      return (
        <div className="mt-2 flex flex-wrap gap-2">
          {streamData.subjects?.map((sub, i) => (
            <span
              key={i}
              className="px-3 py-2 rounded border bg-gray-100 text-gray-800"
            >
              {sub}
            </span>
          ))}
        </div>
      );
    })()}
  <h3 className="text-neutral-500 mt-4">You can update optional subjects from profile section</h3>
  </div>
)}


      <div className="mt-6">
        <button
  onClick={submit}
  disabled={loading}
  className={`w-full py-2 rounded text-white flex items-center justify-center
    ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600"}`}
>
  {loading ? "Saving..." : "Save"}
</button>

      </div>
    </div>
  );
}

export default SubjectRegister;
