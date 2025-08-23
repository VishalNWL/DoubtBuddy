// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import toast from "react-hot-toast";
// import { ClipLoader } from "react-spinners";
// import { Atom } from "react-loading-indicators";
// import { Button, Input, Select } from "../Components";
// import Axios from "../Utils/Axios";
// import SummaryApi from "../Common/SummaryApi";
// import UploadImage from "../Utils/UploadImage";

// function EditDoubt() {
//   const { doubtId } = useParams(); // doubt id from route
//   const navigate = useNavigate();
//   const user = useSelector((state) => state.auth).userData;

//   const [subjectOptions, setSubjectOptions] = useState([]);
//   const [subject, setSubject] = useState("");
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [file, setFile] = useState(null);
//   const [uploadFileURL, setUploadFileURL] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [fileUploadingLoader, setFileUploadingLoader] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);

//   // ✅ Fetch subjects and doubt details
//   useEffect(() => {
//     (async () => {
//       try {
//         // Subjects
//         const subinfo = await Axios({
//           ...SummaryApi.getSubject,
//           data: { Class: user.class },
//         });
//         if (subinfo.status === 200) {
//           setSubjectOptions(subinfo.data.data);
//         }

//         // Doubt details
//         const doubtRes = await Axios({
//           ...SummaryApi.doubtbyId,
//           data: { doubtId: doubtId },
//         });

//         if (doubtRes.data.success) {
//           const d = doubtRes.data.data;
//           setSubject(d.subject || "");
//           setTitle(d.title || "");
//           setDescription(d.questionDescription || "");
//           setUploadFileURL(d.questionPhoto || "");
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load doubt details");
//       }
//     })();
//   }, [doubtId, user.class]);

//   // ✅ File selection/drag-drop
//   const handleChange = async (e) => {
//     const selected = e.target.files[0];
//     if (!selected) return;

//     if (!selected.type.startsWith("image/")) {
//       toast.error("Only images are allowed.");
//       return;
//     }

//     setFile(selected);
//     setFileUploadingLoader(true);
//     const uploaded = await UploadImage(selected);
//     setFileUploadingLoader(false);
//     setUploadFileURL(uploaded);
//   };

//   const handleDrop = async (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFile = e.dataTransfer.files[0];
//     if (!droppedFile) return;

//     if (!droppedFile.type.startsWith("image/")) {
//       toast.error("Only images are allowed.");
//       return;
//     }

//     setFile(droppedFile);
//     setFileUploadingLoader(true);
//     const uploaded = await UploadImage(droppedFile);
//     setFileUploadingLoader(false);
//     setUploadFileURL(uploaded);
//   };

//   // ✅ Update doubt
//   const handleUpdate = async () => {
//     if (!subject || !title.trim()) {
//       return toast.error("Please select a subject and provide a title.");
//     }

//     const payload = {
//       doubtId,
//       subject,
//       title: title,
//       questionDescription: description,
//       questionPhoto: uploadFileURL,
//     };

//     try {
//       setLoading(true);
//       const res = await Axios({
//         ...SummaryApi.updateDoubt,
//         data: payload,
//       });

//       if (res.data.success) {
//         toast.success("Doubt updated successfully!");
//         navigate("/"); // redirect after update
//       } else {
//         toast.error("Failed to update doubt.");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error updating doubt.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto mt-6 p-4 bg-white shadow-md rounded-md">
//       <h2 className="text-xl font-semibold mb-4">Edit Doubt</h2>

//       <div className="mb-3">
//         <Select
//           placeholder="Subject"
//           value={subject}
//           options={subjectOptions}
//           onChange={(e) => setSubject(e.target.value)}
//           className="w-full border px-3 py-2 rounded"
//         />
//       </div>

//       <div className="mb-3">
//         <label className="block font-medium mb-1">
//           Title <span className="text-red-500">*</span>
//         </label>
//         <input
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="w-full border px-3 py-2 rounded"
//           placeholder="Enter your doubt title"
//         />
//       </div>

//       <div className="mb-3">
//         <label className="block font-medium mb-1">Description</label>
//         <textarea
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           rows={4}
//           className="w-full border px-3 py-2 rounded"
//           placeholder="Describe your doubt..."
//         />
//       </div>

//       {/* File upload */}
//       {!fileUploadingLoader ? (
//         <div>
//           <div
//             className={`border-2 border-dashed ${
//               isDragging ? "border-blue-500 bg-blue-50" : "border-gray-400"
//             } p-6 rounded-md text-center cursor-pointer mt-4`}
//             onDragOver={(e) => {
//               e.preventDefault();
//               setIsDragging(true);
//             }}
//             onDragLeave={() => setIsDragging(false)}
//             onDrop={handleDrop}
//             onClick={() =>
//               document.getElementById("hiddenFileInputEdit").click()
//             }
//           >
//             {!uploadFileURL && (
//               <p className="text-gray-600">
//                 📁 Drag and drop an image here, or click to select
//               </p>
//             )}
//             {uploadFileURL && (
//               <div className="mt-3 break-words">
//                 <img
//                   src={uploadFileURL}
//                   alt="uploaded"
//                   className="max-h-40 mx-auto rounded-md"
//                 />
//               </div>
//             )}
//           </div>

//           <Input
//             id="hiddenFileInputEdit"
//             type="file"
//             accept="image/*"
//             className="hidden"
//             onChange={handleChange}
//           />
//         </div>
//       ) : (
//         <div className="flex items-center justify-center py-4">
//           <ClipLoader color="blue" loading={fileUploadingLoader} size={50} />
//         </div>
//       )}

// <Button
//   className="w-full bg-blue-600 text-white py-2 mt-4 rounded hover:bg-blue-700"
//   onClick={handleUpdate}
//   disabled={loading}
// >
//   {loading ? (
//     <div className="scale-50 h-7 flex justify-center items-center">
//       <Atom color={["#fff"]} />
//     </div>
//   ) : (
//     "Update Doubt"
//   )}
// </Button>
//     </div>
//   );
// }

// export default EditDoubt;
import React, { useEffect, useState, useCallback, useRef } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Atom } from "react-loading-indicators";
import { Button, Input, Select } from "../Components";
import Axios from "../Utils/Axios";
import SummaryApi from "../Common/SummaryApi";
import UploadImage from "../Utils/UploadImage";

function EditDoubt() {
  const { doubtId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth).userData;
  const fileInputRef = useRef(null); // 👈 ref for hidden input


  const [subjectOptions, setSubjectOptions] = useState([]);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadFileURL, setUploadFileURL] = useState("");
  const [loading, setLoading] = useState(false); // for update request
  const [fileUploadingLoader, setFileUploadingLoader] = useState(false); // for file upload
  const [isDragging, setIsDragging] = useState(false);

  /** Fetch subjects + existing doubt details */
  useEffect(() => {
    (async () => {
      try {
        const subRes = await Axios({
          ...SummaryApi.getSubject,
          data: { Class: user.class },
        });

        if (subRes.status === 200) setSubjectOptions(subRes.data.data);

        const doubtRes = await Axios({
          ...SummaryApi.doubtbyId,
          data: { doubtId },
        });

        if (doubtRes.data.success) {
          const d = doubtRes.data.data;
          setSubject(d.subject || "");
          setTitle(d.title || "");
          setDescription(d.questionDescription || "");
          setUploadFileURL(d.questionFile || "");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load doubt details");
      }
    })();
  }, [doubtId, user.class]);

  /** File Upload Handler */
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only images are allowed.");
      return;
    }
    try {
      setFileUploadingLoader(true);
      const uploadedURL = await UploadImage(file);
      setUploadFileURL(uploadedURL);
    } catch (err) {
      console.error(err);
      toast.error("File upload failed.");
    } finally {
      setFileUploadingLoader(false);
    }
  }, []);

  /** File Input Change */
  const handleChange = (e) => handleFileUpload(e.target.files[0]);

  /** File Drop */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files[0]);
  };

  /** Update doubt */
  const handleUpdate = async () => {
    if (!subject || !title.trim()) {
      return toast.error("Please select a subject and provide a title.");
    }

    const payload = {
      doubtId,
      subject,
      title,
      questionDescription: description,
      questionPhoto: uploadFileURL, // final file url (old/new)
    };

    try {
      setLoading(true);
      const res = await Axios({ ...SummaryApi.updateDoubt, data: payload });

      if (res.data.success) {
        toast.success("Doubt updated successfully!");
        navigate("/");
      } else {
        toast.error("Failed to update doubt.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating doubt.");
    } finally {
      setLoading(false);
    }
  };

  const isUpdatingOrUploading = loading || fileUploadingLoader;

  return (
    <div className="max-w-xl mx-auto mt-6 p-4 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">Edit Doubt</h2>

      {/* Subject Select */}
      <div className="mb-3">
        <Select
          placeholder="Subject"
          value={subject}
          options={subjectOptions}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Title */}
      <div className="mb-3">
        <label className="block font-medium mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter your doubt title"
        />
      </div>

      {/* Description */}
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

      {/* File Section */}
      <div className="mb-3">
        {/* Existing File */}
        {uploadFileURL && (
          <div className="mb-2 flex items-center justify-between">
            <p className="text-gray-800 truncate max-w-xs">
              Current file: {uploadFileURL.split("/").pop()}
            </p>
            <Button
              className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
              onClick={() => window.open(uploadFileURL, "_blank")}
            >
              See Attachment
            </Button>
          </div>
        )}

     {/* Drag & Drop Area */}
<div
  className={`border-2 border-dashed ${
    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-400"
  } p-6 rounded-md text-center cursor-pointer`}
  onDragOver={(e) => {
    e.preventDefault();
    setIsDragging(true);
  }}
  onDragLeave={() => setIsDragging(false)}
  onDrop={handleDrop}
>
  {fileUploadingLoader ? (
    <Atom color={["#000"]} />
  ) : uploadFileURL ? (
    <p className="text-gray-800 font-medium">
      ✅ File uploaded: {uploadFileURL.split("/").pop()}
    </p>
  ) : (
    <p className="text-gray-600">
      📁 Drag & drop an image here, or use the upload button below
    </p>
  )}
</div>
 {/* Hidden Input */}
      <Input
        ref={fileInputRef}   // 👈 attach ref here
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={fileUploadingLoader || loading}
      />

      {/* Upload Button */}
      <Button
        type="button"
        className={`mt-2 px-4 py-2 rounded-lg bg-green-600 text-white ${
          fileUploadingLoader || loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => fileInputRef.current?.click()}  // 👈 safe trigger
        disabled={fileUploadingLoader || loading}
      >
        {fileUploadingLoader ? "Uploading..." : "Upload File"}
      </Button>
      </div>

      {/* Update Button */}
      <Button
        className="w-full bg-blue-600 text-white py-2 mt-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleUpdate}
        disabled={isUpdatingOrUploading}
      >
        {isUpdatingOrUploading ? (
          <div className="scale-50 h-7 flex justify-center items-center">
            <Atom color={["#fff"]} />
          </div>
        ) : (
          "Update Doubt"
        )}
      </Button>
    </div>
  );
}

export default EditDoubt;
