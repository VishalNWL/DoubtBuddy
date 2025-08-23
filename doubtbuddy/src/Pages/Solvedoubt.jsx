import React, { useEffect, useState } from 'react'
import HeaderTeacher from '../Components/HeaderTeacher'
import { useLocation, useParams } from 'react-router-dom';
import { FaClock, FaPaperclip } from "react-icons/fa";
import { Button,Input } from '../Components';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css'
import { ClipLoader } from "react-spinners";
import { Atom } from "react-loading-indicators";
import toast from 'react-hot-toast';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import Axios from '../Utils/Axios';
import SummaryAPi from '../Common/SummaryApi';
import UploadImage from '../Utils/UploadImage';

dayjs.extend(relativeTime);

function Solvedoubt() {
  const { id ,idt } = useParams(); 
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
  const [uploadFileURL,setUploadFileURL]= useState("")
  const [fileUploadingLoader , setFileUploadingLoader] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const student = queryParams.get("student") || "Vishal Nemiwal";
  const title = queryParams.get("title") || "Sir, how can we calculate speed of light without having an expensive instrument.";

  const handleChange = async (e) => {
    const selectedfile = e.target.files[0];
    if(!selectedfile) return;

    setFile(selectedfile);
    
    if (selectedfile.type.startsWith("image/")) {
      setfiletype('photo')
    } else {
      toast.error("Only photos are allowed.");
      return;
    }

    setFileUploadingLoader(true);
    const uploadfile = await UploadImage(selectedfile);
    setUploadFileURL(uploadfile);
    setFileUploadingLoader(false);
  };

  const handleUpload = async () => {
    if (!file && !anstxt) return;

    setLoading(true);

    try {
      const res = await Axios({
        ...SummaryAPi.submitAnswer,
        data: {
          answerPhoto:uploadFileURL,
          answerText: anstxt,
          status: "answered",
          answeredBy: idt,
          doubtId: id,
        },
      });

      if (res.data.success) {
        toast.success("Answer Submitted Successfully");
        setanstxt("");
        setFile(null);
        setfiletype("");
        setUploadFileURL("");
        window.history.back();
      } else {
        toast.error("There is some problem while uploading the doubt");
      }
    } catch (err) {
      toast.error("Error occurred during upload.");
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

      if (doubt.data.success) {
        settime(dayjs(doubt.data.data.createdAt).fromNow());
        setdescription(doubt.data.data.questionDescription);
        setquestionphoto(doubt.data.data.questionFile);
      }
    })();
  },[id]);

  return (
    <>
      <div className='px-4'>
        <div name='questiondiv'>
          <div className='flex w-full justify-around'>
            <span><b>Student:</b> {student}</span>
            <span> <FaClock className="text-gray-500 inline-block mr-1" />{time}</span>
          </div>

          <div className='mt-10 bg-blue-200 shadow-md rounded-lg p-2'>
            <h1><b>Title: </b>{title}</h1>
          </div>

          {description && (
            <div className='mt-5 bg-blue-200 shadow-md rounded-lg p-2'>
              <h1><b>Description: </b>{description}</h1>
            </div>
          )}

          {questionphoto && (
            <> 
              <Button className='rounded-sm p-2 bg-slate-500 mt-4 hover:bg-slate-600'  
                onClick={() => { setopen(true) }} >
                <FaPaperclip className='inline-block mr-2'/>See Attachment
              </Button>

              <Lightbox
                open={open}
                close={() => setopen(false)}
                slides={[{ src: questionphoto }]}
              />
            </>
          )}
        </div>

        <hr className='border-t border-1 border-gray-300 my-4'/>
        <h1>Solution:-</h1>

        <textarea 
          placeholder='Start Writing your answer...'
          value={anstxt}
          onChange={(e)=>setanstxt(e.target.value)}
          className='w-full resize-none border border-slate-500 outline-none mt-2 p-3 shadow-md rounded'
          rows={4}
        />

        {/* File upload drag and drop */}
        {!fileUploadingLoader ? (
          <div
            className={`border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-400'} p-6 rounded-md text-center cursor-pointer mt-4`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={async(e) => {
              e.preventDefault();
              setIsDragging(false);
              const droppedFile = e.dataTransfer.files[0];
              if (!droppedFile) return;

              setFile(droppedFile);

              if (droppedFile.type.startsWith("image/")) {
                setfiletype("photo");
              } else {
                alert("Only images are allowed.");
                setFile(null);
                setfiletype('');
              }

              setFileUploadingLoader(true);
              const uploadfile = await UploadImage(droppedFile);
              setUploadFileURL(uploadfile);
              setFileUploadingLoader(false);
            }}
            onClick={() => document.getElementById("hiddenFileInput").click()}
          >
            {!file && <p className="text-gray-600">📁 Drag and drop an image here, or click to select</p>}
            {file && (
              <div className="mt-3 text-green-600 break-words">
                Selected file: <strong>{file.name}</strong> ({filetype})
              </div>
            )}
          </div>
        ) : (
          <div className='flex items-center justify-center mt-4'>
            <ClipLoader
              color='blue'
              loading={fileUploadingLoader}
              size={50}
            />
          </div>
        )}

        {!file && (
          <Input
            type='file'
            label='If no file then keep it empty'
            accept="image/*"
            onChange={handleChange}
          />
        )}

        {/* Submit button with loading state */}
        <Button
          className="w-full bg-blue-600 text-white py-2 mt-4 rounded hover:bg-blue-700 shadow-lg"
          onClick={handleUpload}
          disabled={loading || (!uploadFileURL && !anstxt)}
        >
          {loading 
            ? <div className='scale-50 h-7 flex justify-center items-center'><Atom color={["#ffff"]}/></div> 
            : "Submit Solution"}
        </Button>
      </div>
    </>
  )
}

export default Solvedoubt
