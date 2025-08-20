import React, { useState } from 'react';
import HeaderStudent from '../Components/HeaderStudent';
import { Button, Input, Select } from '../Components';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../Utils/Axios';
import SummaryAPi from '../Common/SummaryApi';

function CreateDoubt() {
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [loading, setLoading] = useState(false);
  const [subjectOptions,setSubjectOptions]=useState([]);
  const [totaldoubts,settotaldoubts]=useState([]);
  const [pending,setpending] = useState(0);
  const [total,settotal] = useState(0);
  const [filetype,setfiletype]=useState('');
  const [isDragging, setIsDragging] = useState(false);

  const user = useSelector((state)=>state.auth).userData;
  // console.log(user)
 
  useEffect(()=>{
     (async ()=>{
        const Class = user.class
        console.log(user)
        const subinfo= await Axios({
          ...SummaryAPi.getSubject,
          data: {Class}
        })
        
        
        if(subinfo.status===200){
          setSubjectOptions(subinfo.data.data);
        }  
        
        
    const totaldoubtsbystudent= await Axios({
      ...SummaryAPi.totalStudentDoubt,
      data:{studentId:user._id}
    })

    console.log(totaldoubtsbystudent)

    if(totaldoubtsbystudent.data.success){
      settotaldoubts(totaldoubtsbystudent.data.data);
    }
    
     totaldoubts.forEach(e=>{
         if(e.status==='unanswered'){
           setpending(pending+1);
         }
         settotal(total+1);
     })
                
     })();
  },[])

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.type.startsWith("image/")) {
      setFileType("photo");
    } else if (selected.type.startsWith("video/")) {
      setFileType("video");
    } else {
      alert("Only image and video files are allowed.");
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!subject || !title.trim()) {
      return alert("Please select a subject and provide a title.");
    }

    const formData = new FormData();
    formData.append("askedBy",user._id);
    formData.append("subject", subject);
    formData.append("title", title.trim());
    formData.append("questionDescription", description.trim());

    if (file && fileType === "photo") {
      formData.append("questionPhoto", file);
    } else if (file && fileType === "video") {
      alert("File must be an image");
      return;
    }

    setLoading(true);

    try {
      const res = await Axios({
        ...SummaryAPi.createDoubt,
        data:formData
      })

      console.log(res)

      if (res.data.success) {
        alert("Doubt submitted successfully!");
        setSubject('');
        setTitle('');
        setDescription('');
        setFile(null);
        setFileType('');
      } else {
        alert("Failed to submit doubt.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-xl mx-auto mt-6 p-4 bg-white shadow-md rounded-md">
        <h2 className="text-xl font-semibold mb-4">Ask a Doubt</h2>

        <div className="mb-3">
          <Select
            placeholder="Subject"
            value={subject}
            options={subjectOptions}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

        </div>

        <div className="mb-3">
          <label className="block font-medium mb-1">Title <span className="text-red-500">*</span></label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter your doubt title"
          />
        </div>

        <div className="mb-3">
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border px-3 py-2 rounded"
            placeholder="Describe your doubt..."
          />
        </div>

<div
  className={`border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-400'} p-6 rounded-md text-center cursor-pointer mt-4`}
  onDragOver={(e) => {
    e.preventDefault();
    setIsDragging(true);
  }}
  onDragLeave={() => setIsDragging(false)}
  onDrop={(e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    setFile(droppedFile);

    if (droppedFile.type.startsWith("image/")) {
      setfiletype("photo");
    } else if (droppedFile.type.startsWith("video/")) {
      setfiletype("video");
    } else {
      alert("Only image and video files are allowed.");
      setFile(null);
      setfiletype('');
    }
  }}
  onClick={() => document.getElementById("hiddenFileInput").click()}
>

  {!file && <p className="text-gray-600">📁 Drag and drop an image/video here, or click to select</p>}
{file && (
  <div className="mt-3 text-green-600 break-words">
    Selected file: <strong>{file.name}</strong> ({filetype})
  </div>
)}
  </div>

    {!file &&  <Input
      type='file'
      label='If no file then keep it empty'
      accept="image/*,video/*"
      onChange={handleChange}
     />}

        <Button
          className="w-full bg-blue-600 text-white py-2 mt-4 rounded hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Doubt"}
        </Button>
      </div>
    </>
  );
}

export default CreateDoubt;
