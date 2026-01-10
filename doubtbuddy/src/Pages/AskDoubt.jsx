import React, { useState } from 'react';
import HeaderStudent from '../Components/HeaderStudent';
import { Button, Input, Select } from '../Components';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Axios from '../Utils/Axios';
import SummaryAPi from '../Common/SummaryApi';
import UploadImage from '../Utils/UploadImage';
import {Atom} from 'react-loading-indicators'
import toast from 'react-hot-toast';
import { ClipLoader } from "react-spinners";
import axios from 'axios';

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
  const [uploadFileURL,setUploadFileURL]=useState("")
  const [fileUploadingLoader , setFileUploadingLoader] = useState(false);
  const [fileDeletingLoader,setFileDeletingLoader]=useState(false);

  const user = useSelector((state)=>state.auth).userData;
  // console.log(user)
 
  useEffect(()=>{
     (async ()=>{
        const Class = user.class
         const stream = user.class>10 ? user.stream : null;

        const subinfo= await Axios({
          ...SummaryAPi.getSubject,
          data: {Class , school:user.school ,stream}
        })
         
        
        if(subinfo.status===200){
          const classes = subinfo.data.data.subjects;
          if(user.class>10){
             classes.push(user.optionalSubject);
          }
          setSubjectOptions(classes);
        }  
        
        
    const totaldoubtsbystudent= await Axios({
      ...SummaryAPi.totalStudentDoubt,
      data:{studentId:user._id}
    })
 


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

  const handleChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.type.startsWith("image/")) {
      setFileType("photo");
    }
    else {
      toast.error("Only image are allowed.");
      return;
    }
    setFile(selected);
    setFileUploadingLoader(true);
    const uploadfile = await UploadImage(selected);
    setFileUploadingLoader(false);
    setUploadFileURL(uploadfile);
  };

  const handleSubmit = async () => {
    if (!subject || !title.trim()) {
      return toast.error("Please select a subject and provide a title.");
    }


    const payload = {
  askedBy: user._id,
  subject,
  schoolId:user.school,
  title: title.trim(),
  questionDescription: description.trim(),
  questionPhoto: uploadFileURL, // plain URL
};

   

    try {

      setLoading(true);
      

    const res = await Axios({
    ...SummaryAPi.createDoubt,
    data: payload
  });

  

      if (res.data.success) {
        toast.success("Doubt submitted successfully!");
        setSubject('');
        setTitle('');
        setDescription('');
        setFile(null);
        setFileType('');
      } else {
        toast.error("Failed to submit doubt.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };


 const handleDeleteFile=async()=>{
     try {
       setFileDeletingLoader(true)
      
     const response=  await Axios({
        ...SummaryAPi.deleteFile,
        data:{URL:uploadFileURL}
       })

       if(response.data.success){
       setUploadFileURL("");
       setFile(null);
       toast.success("File removed successfully");
       return;
       }
       toast.error("There is some error while deleting the file try again")

     } catch (error) {
       console.log("something went wrong while deleting file in edit",error);
       toast.error("Something went wrong while deleting file");

     }
     finally{
      setFileDeletingLoader(false);
     }
  }
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

 {
  !fileUploadingLoader ?(
     <div>
       {uploadFileURL && (
                <div className="mb-2 flex items-center justify-between">
                  
                  <Button
                    className={`bg-red-500 text-white rounded ml-2 ${fileDeletingLoader?'disabled opacity-50 cursor-not-allowed':''}`}
                    onClick={() =>handleDeleteFile()}
                  >
                    {fileDeletingLoader?"Deleting...":"Delete"}
                  </Button>
                  <Button
                    className={`bg-blue-500 text-white rounded ml-2 ${fileDeletingLoader?'disabled opacity-50 cursor-not-allowed':''}`}
                    onClick={() => window.open(uploadFileURL, "_blank")}
                  >
                    File
                  </Button>
                </div>
              )}
      <div
  className={`border-2 border-dashed ${!uploadFileURL?'hidden md:block':'block'} ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-400'} p-6 rounded-md text-center cursor-pointer mt-4`}
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
    }  else {
      toast.error("Only image are allowed.");
      setFile(null);
      setfiletype('');
    }
    const uploadfile = await UploadImage(droppedFile);
    setUploadFileURL(uploadfile);

  }}
  onClick={() => document.getElementById("hiddenFileInput").click()}
>

  {!file && <p className="text-gray-600">📁 Drag and drop an image/video here, or click to select</p>}
{file && (
  <div className="mt-3 text-green-600 break-words" onClick={()=> window.open(uploadFileURL, "_blank")}>
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


     </div>
  ):(
    <div>
        <div className='flex items-center justify-center'>
          <ClipLoader
        color='blue'
        loading={fileUploadingLoader}
        size={50}
      />
           
        </div>
    </div>
  )
 }
          
            <Button
          className="w-full bg-blue-600 text-white py-2 mt-4 rounded hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={loading || (!uploadFileURL && !description)}
        >

          {loading ? <div className='scale-50 h-7 flex justify-center items-center'><Atom color={["#ffff"]}/></div> : "Submit Doubt"}
        </Button>
        
      </div>
    </>
  );
}

export default CreateDoubt;
