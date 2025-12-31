import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Button from "./Buttons";

function AddClassPage({ close, onSave, initialData = null }) {

  const [classInfo, setClassInfo] = useState([]);
  const [selectedClass, setSelectedClass] = useState(5);
  const [batch, setBatch] = useState("");
  const [isHigherSchool , setIsHigherSchool] = useState(false);
  const [board , setBoard] = useState("RBSE");
  const [higherClass, setHigherClass] = useState(11);
  const [higherBatch, setHigherBatch] = useState("");
  const [selectedCommerceSubject, setSelectedCommerceSubject] = useState("");
  const [selectedArtsSubject, setSelectedArtsSubject] = useState("");
  const [selectedScienceSubject, setSelectedScienceSubject] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [streams, setStreams] = useState([]);

  const streamOptions = {
    RBSE: [
      { label: "Science", key: "Science" },
      { label: "Commerce", key: "Commerce" },
      { label: "Arts / Humanities", key: "Arts" }
    ],
    CBSE: [
      { label: "Science", key: "Science" },
      { label: "Commerce", key: "Commerce" },
      { label: "Arts / Humanities", key: "Arts" }
    ]
  };


  // --------------- PREFILL ----------------
  useEffect(() => {

    if (!initialData) return;

    // CLASSES
    if (Array.isArray(initialData.classes)) {

      const flat = [];

      initialData.classes.forEach(item => {
        (item?.batches || []).forEach(batch => {
          flat.push({
            class: Number(item.class),
            batch
          });
        });
      });

      setClassInfo(flat);
    }

    // SUBJECTS
    if (Array.isArray(initialData.OptionalSubjects)) {

      setStreams(
        initialData.OptionalSubjects.map(s => ({
          [s.stream]: s.subjects || []
        }))
      );

      setIsHigherSchool(initialData.OptionalSubjects.length > 0);
    }

  }, [initialData]);



  const scienceSubjects = ["Math","Biology"];

  const artsSubjects = [
    "History","Political Science","Geography","Psychology","Sociology",
    "Economics","Philosophy","Fine Arts","Home Science","Music","Legal Studies"
  ];

  const commerceNoMathSubjects = [
    "Math","Accountancy","Business Studies","Economics",
    "Informatics Practices","Entrepreneurship","Physical Education",
    "Psychology","Fine Arts","Legal Studies"
  ];


  // --------------- ADD STREAM ----------------
  const addStream = () => {

    let subject = "";

    if (selectedStream === "Commerce") subject = selectedCommerceSubject;
    if (selectedStream === "Arts") subject = selectedArtsSubject;
    if (selectedStream === "Science") subject = selectedScienceSubject;

    if (!subject) return;

    setStreams(prev => {

      const idx = prev.findIndex(s => Object.keys(s)[0] === selectedStream);

      if (idx !== -1) {
        const updated = [...prev];
        const key = Object.keys(updated[idx])[0];

        if (!updated[idx][key].includes(subject)) {
          updated[idx][key] = [...updated[idx][key], subject];
        }

        return updated;
      }

      return [...prev, { [selectedStream]: [subject] }];
    });

    setSelectedStream("");
    setSelectedCommerceSubject("");
    setSelectedArtsSubject("");
    setSelectedScienceSubject("");
  };


  // --------------- ADD CLASS ----------------
  const addValues = (e) => {
    e.preventDefault();

    if (!batch.trim()) return;

    setClassInfo(prev => [
      ...prev,
      { class: Number(selectedClass), batch }
    ]);

    setBatch("");
  };


  const removeValue = (i) =>
    setClassInfo(prev => prev.filter((_, idx) => idx !== i));


  const removeSingleSubject = (streamIdx, subject) => {
    setStreams(prev => {
      const updated = [...prev];
      const key = Object.keys(updated[streamIdx])[0];

      updated[streamIdx][key] =
        updated[streamIdx][key].filter(s => s !== subject);

      if (!updated[streamIdx][key].length)
        updated.splice(streamIdx, 1);

      return updated;
    });
  };


  // --------------- DONE ----------------
  const handleDone = () => {

    if (!classInfo.length) {
      alert("Please add at least one class");
      return;
    }

    if (isHigherSchool && !streams.length) {
      alert("Please add streams");
      return;
    }

    // group classes
    const classMap = {};

    classInfo.forEach(item => {
      if (!classMap[item.class]) classMap[item.class] = [];
      classMap[item.class].push(item.batch);
    });

    const classes = Object.keys(classMap).map(k => ({
      class: parseInt(k, 10),
      batches: classMap[k]
    })).filter(c => !isNaN(c.class));


    // format subjects
    const OptionalSubjects = streams.map(s => {
      const key = Object.keys(s)[0];
      return { stream: key, subjects: s[key] };
    });

    onSave?.({ classes, OptionalSubjects });

    close();
  };


 return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-2">
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-2xl w-full max-w-[45rem] max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
          Add Classes & Streams
        </h2>
        <button onClick={close} className="text-red-500 hover:text-red-700">
          <IoClose size={28} className="md:size-[30px]" />
        </button>
      </div>

      {/* Existing Classes */}
      {classInfo.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Added Classes</h3>

          <div className="flex flex-wrap gap-2">
            {classInfo.map((el, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full"
                onClick={() => removeValue(idx)}
              >
                <span>{el.class}th — {el.batch}</span>
                <button>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Middle School */}
      <div className="mt-6 p-4 rounded-xl border bg-gray-50">
        <h3 className="font-semibold text-gray-800">
          Add Middle School Classes (5–10)
        </h3>

        <div className="flex flex-wrap gap-3 mt-3">
          <select
            className="border rounded-lg px-3 py-2 w-full sm:w-auto"
            value={selectedClass}
            onChange={(e)=>setSelectedClass(e.target.value)}
          >
            {[5,6,7,8,9,10].map(c=>(
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            placeholder="Batch (eg. A)"
            className="px-3 py-2 rounded-lg border w-full sm:w-auto"
            value={batch}
            onChange={(e)=>setBatch(e.target.value.toUpperCase())}
          />

          <Button className="w-full sm:w-auto" onClick={addValues}>Add</Button>
        </div>
      </div>

      {/* Radio */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-800">
          Does your school include classes 11 & 12?
        </h3>

        <div className="flex flex-wrap gap-6 mt-2">
          <label><input type="radio" checked={isHigherSchool} onChange={()=>setIsHigherSchool(true)} /> Yes</label>
          <label><input type="radio" checked={!isHigherSchool} onChange={()=>setIsHigherSchool(false)} /> No</label>
        </div>
      </div>

      {isHigherSchool && (
        <>
          {/* Board */}
          <div className="mt-6 p-4 rounded-xl border bg-gray-50">
            <h3 className="font-semibold text-gray-800">Senior Secondary Board</h3>

            <select
              value={board}
              onChange={(e)=>{ setBoard(e.target.value); setStreams([]); }}
              className="mt-2 px-3 py-2 border rounded-lg w-full sm:w-auto"
            >
              <option value="RBSE">RBSE</option>
              <option value="CBSE">CBSE</option>
            </select>
          </div>

          {/* Higher Classes */}
          <div className="mt-6 p-4 rounded-xl border bg-gray-50">
            <h3 className="font-semibold text-gray-800">Add Senior School Classes (11–12)</h3>

            <div className="flex flex-wrap gap-3 mt-3">
              <select
                className="border rounded-lg px-3 py-2 w-full sm:w-auto"
                value={higherClass}
                onChange={e=>setHigherClass(Number(e.target.value))}
              >
                {[11,12].map(c=>(
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <input
                placeholder="Batch (eg. SCI-A)"
                className="px-3 py-2 rounded-lg border w-full sm:w-auto"
                value={higherBatch}
                onChange={e=>setHigherBatch(e.target.value.toUpperCase())}
              />

              <Button className="w-full sm:w-auto" onClick={()=>{
                if(!higherBatch.trim()) return;
                setClassInfo(prev=>[
                  ...prev,
                  { class:higherClass, batch:higherBatch }
                ]);
                setHigherBatch("");
              }}>
                Add
              </Button>
            </div>
          </div>

          {/* Stream Chips */}
          {streams.length>0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800">Selected Streams & Subjects</h3>

              <div className="flex flex-wrap gap-2 mt-2">
                {streams.map((s,i)=>{
                  const name = Object.keys(s)[0];
                  return s[name].map(sub=>(
                    <div key={name+sub}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 border rounded-full">
                      <span>{name} — {sub}</span>
                      <button onClick={()=>removeSingleSubject(i,sub)}>✕</button>
                    </div>
                  ))
                })}
              </div>
            </div>
          )}

          {/* Add Streams */}
          <div className="mt-6 p-4 rounded-xl border bg-gray-50">
            <h3 className="font-semibold text-gray-800">Add Streams & Optional Subjects</h3>

            <div className="flex flex-wrap gap-3 mt-3 items-center">

              <select
                className="border rounded-lg px-3 py-2 w-full sm:w-auto"
                value={selectedStream}
                onChange={e=>setSelectedStream(e.target.value)}
              >
                <option value="">Select Stream</option>
                {streamOptions[board].map(s=>
                  <option key={s.key} value={s.key}>{s.label}</option>
                )}
              </select>

              {selectedStream==="Commerce" && (
                <select className="border rounded-lg px-3 py-2 w-full sm:w-auto"
                  value={selectedCommerceSubject}
                  onChange={e=>setSelectedCommerceSubject(e.target.value)}>
                  <option value="">Select Subject</option>
                  {commerceNoMathSubjects.map(s=>
                    <option key={s}>{s}</option>
                  )}
                </select>
              )}

              {selectedStream==="Arts" && (
                <select className="border rounded-lg px-3 py-2 w-full sm:w-auto"
                  value={selectedArtsSubject}
                  onChange={e=>setSelectedArtsSubject(e.target.value)}>
                  <option value="">Select Subject</option>
                  {artsSubjects.map(s=>
                    <option key={s}>{s}</option>
                  )}
                </select>
              )}

              {selectedStream==="Science" && (
                <select className="border rounded-lg px-3 py-2 w-full sm:w-auto"
                  value={selectedScienceSubject}
                  onChange={e=>setSelectedScienceSubject(e.target.value)}>
                  <option value="">Select Subject</option>
                  {scienceSubjects.map(s=>
                    <option key={s}>{s}</option>
                  )}
                </select>
              )}

              <Button className="w-full sm:w-auto" onClick={addStream}>Add</Button>

            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleDone}>Done</Button>
      </div>

    </div>
  </div>
);

}

export default AddClassPage;
