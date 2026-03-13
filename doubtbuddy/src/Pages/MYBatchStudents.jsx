import { useParams } from 'react-router-dom'
import SummaryAPi from '../Common/SummaryApi'
import Axios from '../Utils/Axios'
import UploadFile from '../Utils/UploadFile'
import React, { useEffect, useState } from 'react'

function MYBatchStudents() {
  const { class: className, batch } = useParams();

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [batchUploads, setBatchUploads] = useState([])
  const [studentUploads, setStudentUploads] = useState({})
  const [uploading, setUploading] = useState(false)
  const [selectedBatchFile, setSelectedBatchFile] = useState(null)
  const [selectedStudentFile, setSelectedStudentFile] = useState(null)

  useEffect(() => {
    const fetchBatchStudents = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await Axios({
          ...SummaryAPi.BatchStudentsForTeacher,
          data: {
            class: className,
            batch,
          },
        })

        setStudents(res?.data?.data || [])
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    if (className && batch) {
      fetchBatchStudents()
      fetchBatchUploads()
    }
  }, [className, batch])

  const fetchBatchUploads = async () => {
    try {
      const res = await Axios({
        ...SummaryAPi.getUploadsForBatch,
        url: `${SummaryAPi.getUploadsForBatch.url}/${className}/${batch}`
      })
      setBatchUploads(res?.data?.data || [])
    } catch (err) {
      console.error('Failed to fetch batch uploads', err)
    }
  }

  const fetchStudentUploads = async (studentId) => {
    try {
      const res = await Axios({
        ...SummaryAPi.getUploadsForStudent,
        url: `${SummaryAPi.getUploadsForStudent.url}/${studentId}`
      })
      setStudentUploads(prev => ({ ...prev, [studentId]: res?.data?.data || [] }))
    } catch (err) {
      console.error('Failed to fetch student uploads', err)
    }
  }

  const handleBatchUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedBatchFile(file)
  }

  const confirmBatchUpload = async () => {
    if (!selectedBatchFile) return
    setUploading(true)
    try {
      await UploadFile(selectedBatchFile, { class: className, batch, type: 'batch' })
      fetchBatchUploads()
      setSelectedBatchFile(null)
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  const cancelBatchUpload = () => {
    setSelectedBatchFile(null)
  }

  const handleStudentUpload = async (studentId, file) => {
    if (!file) return
    setSelectedStudentFile({ studentId, file })
  }

  const confirmStudentUpload = async () => {
    if (!selectedStudentFile) return
    setUploading(true)
    try {
      await UploadFile(selectedStudentFile.file, { class: className, batch, type: 'individual', studentId: selectedStudentFile.studentId })
      fetchStudentUploads(selectedStudentFile.studentId)
      setSelectedStudentFile(null)
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  const cancelStudentUpload = () => {
    setSelectedStudentFile(null)
  }

  const handleDeleteUpload = async (uploadId, type, studentId) => {
    try {
      await Axios({
        ...SummaryAPi.deleteUpload,
        url: `${SummaryAPi.deleteUpload.url}/${uploadId}`
      })
      if (type === 'batch') {
        fetchBatchUploads()
      } else {
        fetchStudentUploads(studentId)
      }
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const closeModal = () => {
    setSelectedStudent(null)
    setSelectedStudentFile(null)
  }

  const openModal = (student) => {
    setSelectedStudent(student)
    fetchStudentUploads(student._id)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold">Batch Students</h1>
        <p className="text-sm text-gray-600">
          Class {className} • Batch {batch}
        </p>
      </div>

      {/* Batch Uploads Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Common Batch Files</h2>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="file"
            onChange={handleBatchUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
        </div>
        {selectedBatchFile && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-medium text-yellow-800">Selected file: {selectedBatchFile.name}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={confirmBatchUpload}
                disabled={uploading}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
              >
                Upload
              </button>
              <button
                onClick={cancelBatchUpload}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {batchUploads.map(upload => (
            <div key={upload._id} className="flex items-center justify-between p-2 bg-white rounded border">
              <a href={upload.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {upload.fileName}
              </a>
              <button
                onClick={() => handleDeleteUpload(upload._id, 'batch')}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-500">Loading students…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {!loading && !error && students.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No students found for this batch.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <button
            key={student._id}
            type="button"
            onClick={() => openModal(student)}
            className="text-left bg-white border rounded-xl shadow-sm p-4 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-semibold text-blue-700">
                {student.fullname?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{student.fullname}</div>
                <div className="text-sm text-gray-500">{student.email}</div>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              Class {student.class} • Batch {student.batch}
            </div>
          </button>
        ))}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-start justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedStudent.fullname}</h2>
                <div className="text-sm text-gray-500">Student details</div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 rounded-full p-2"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="text-sm">
                <span className="font-semibold">Email:</span> {selectedStudent.email}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Class:</span> {selectedStudent.class}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Batch:</span> {selectedStudent.batch}
              </div>
              {selectedStudent.stream && (
                <div className="text-sm">
                  <span className="font-semibold">Stream:</span> {selectedStudent.stream}
                </div>
              )}
              {selectedStudent.optionalSubject && (
                <div className="text-sm">
                  <span className="font-semibold">Optional Subject:</span>{' '}
                  {selectedStudent.optionalSubject}
                </div>
              )}

              <div className="text-sm">
                <span className="font-semibold">Status:</span>{' '}
                <span className={
                  selectedStudent.status === 'active'
                    ? 'text-green-600'
                    : 'text-gray-600'
                }>
                  {selectedStudent.status}
                </span>
              </div>

              {/* Student Uploads */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Uploads for this student</h3>
                <input
                  type="file"
                  onChange={(e) => handleStudentUpload(selectedStudent._id, e.target.files[0])}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                />
                {selectedStudentFile && selectedStudentFile.studentId === selectedStudent._id && (
                  <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs font-medium text-yellow-800">Selected: {selectedStudentFile.file.name}</p>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={confirmStudentUpload}
                        disabled={uploading}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Upload
                      </button>
                      <button
                        onClick={cancelStudentUpload}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {(studentUploads[selectedStudent._id] || []).map(upload => (
                    <div key={upload._id} className="flex items-center justify-between p-1 bg-gray-50 rounded text-sm">
                      <a href={upload.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                        {upload.fileName}
                      </a>
                      <button
                        onClick={() => handleDeleteUpload(upload._id, 'individual', selectedStudent._id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Del
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-full mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MYBatchStudents