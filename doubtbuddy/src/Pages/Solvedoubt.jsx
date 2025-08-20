import React, { useEffect, useState } from 'react'
import HeaderTeacher from '../Components/HeaderTeacher'
import { useLocation, useParams } from 'react-router-dom';
import { FaClock, FaPaperclip } from "react-icons/fa";
import { Button,Input } from '../Components';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css'

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import Axios from '../Utils/Axios';
import SummaryAPi from '../Common/SummaryApi';

dayjs.extend(relativeTime);


function Solvedoubt() {
  const { id ,idt} = useParams(); // from :id in the route
  
  const location = useLocation();
  const [time, settime] = useState('');
  const [questionphoto, setquestionphoto] = useState('');
  const [description, setdescription] = useState("");
  const [open, setopen] = useState(false);
  const [anstxt,setanstxt]=useState('');
  const [file, setFile] = useState(null);
  const [filetype,setfiletype]=useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);


  const queryParams = new URLSearchParams(location.search);
  const student = queryParams.get("student") || "Vishal Nemiwal";
  const title = queryParams.get("title") || "Sir, how can we calculate speed of light without having an expensive instrument.";


  const handleChange = (e) => {
   const selectedfile=e.target.files[0];

     if(!selectedfile)return ;
    setFile(selectedfile);
    
  if (selectedfile.type.startsWith("image/")) {
    
    setfiletype('photo')
    // Handle audio file
  } else if (selectedfile.type.startsWith("video/")) {
  
    setfiletype('video');
    // Handle video file
  } else {
    alert("Only photo and video files are allowed.");
  }

  };

  const handleDrop = (e) => {
  e.preventDefault();
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
    setfiletype("");
  }
};

const handleUpload = async () => {
  if (!file && !anstxt) return;

  setLoading(true);

  const formData = new FormData();

  if (file && filetype === "photo") {
    formData.append("answerPhoto", file);
  } else if (file && filetype === "video") {
    formData.append("answerVideo", file);
  }

  formData.append("answerText", anstxt);
  formData.append("status", "answered");
  formData.append("answeredBy", idt);
  formData.append('doubtId',id)
 
  try {
    const res = await Axios({
      ...SummaryAPi.submitAnswer,
      data:formData
    })

    if(res.data.success){
      alert("Answer Submitted Successfully");
      setanstxt("");

    }
    else{
      alert("There is some problem while uploading the doubt")
    }
  } catch (err) {
    alert("Error occurred during upload.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    (async () => {
      const doubt = await Axios({
        ...SummaryAPi.doubtbyId,
        data:{doubtId:id}
      });

        console.log(doubt)
      if (doubt.data.success) {
        settime(dayjs(doubt.data.data.createdAt).fromNow());
        setdescription(doubt.data.data.questionDescription);
        setquestionphoto(doubt.data.data.questionFile);
      }

    })();
  },[id])

  return (
    <>
      
      <div className='px-4'>
        <div name='questiondiv'>
        <div className='flex w-full justify-around'>
          <span><b>Student:</b> {student}</span>
          <span> <FaClock className="text-gray-500 inline-block mr-1" />{time}</span>
        </div>

        <div className='mt-10 bg-gray-300 rounded-lg p-2'>
          <h1><b>Title: </b>{title}</h1>
        </div>

        {description && <div className='mt-5 bg-gray-300 rounded-lg p-2'>
          <h1><b>Description: </b>{description}</h1>
        </div>}

        {
          questionphoto &&
          <> <Button className='rounded-sm p-2 bg-slate-500 mt-4 hover:bg-slate-600'><FaPaperclip className='inline-block mr-2' onClick={() => { setopen(true) }} />See Attachment</Button>

            <Lightbox
              open={open}
              close={() => setopen(false)}
              slides={[{ src: questionphoto }]}
            />
          </>
        }
      </div>

     <hr className='border-t border-1 border-gray-300 my-4'/>
     <h1>Solution:-</h1>

     <textarea placeholder='Start Writing your answer...'
       value={anstxt}
       onChange={(e)=>setanstxt(e.target.value)}
       className='w-full resize-none border border-black outline-none mt-2 p-3'
       rows={4}
     />
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
  <div className="mt-3 text-green-600">
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
     
{
  loading ? (
    <div className="flex items-center mt-5 ml-2">
      <div className="loader border-4 border-blue-500 border-t-transparent w-6 h-6 rounded-full animate-spin mr-2"></div>
      <span>Uploading...</span>
    </div>
  ) : (
    <Button className="block mt-5 rounded-sm p-2 ml-2" onClick={handleUpload}>
      Submit
    </Button>
  )
}    
      </div>
     
    </>
  )
}

export default Solvedoubt