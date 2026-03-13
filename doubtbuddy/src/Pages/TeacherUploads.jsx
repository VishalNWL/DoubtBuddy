import React, { useEffect, useState } from 'react'
import Axios from '../Utils/Axios'
import SummaryAPi from '../Common/SummaryApi'
import { useParams } from 'react-router-dom'

function TeacherUploads() {
  const { teacherId } = useParams()
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUploads = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await Axios({
          ...SummaryAPi.uploadsFromTeacher,
          url: `${SummaryAPi.uploadsFromTeacher.url}/${teacherId}`
        })

        setUploads(res?.data?.data || [])
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load uploads')
      } finally {
        setLoading(false)
      }
    }

    if (teacherId) {
      fetchUploads()
    }
  }, [teacherId])

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed', error)
      // Fallback to opening in new tab
      window.open(fileUrl, '_blank')
    }
  }

  const handleDelete = async (uploadId) => {
    if (!confirm('Are you sure you want to delete this upload?')) return

    try {
      await Axios({
        ...SummaryAPi.deleteUpload,
        url: `${SummaryAPi.deleteUpload.url}/${uploadId}`
      })
      setUploads(uploads.filter(u => u._id !== uploadId))
    } catch (err) {
      alert('Failed to delete upload')
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold">Teacher Uploads</h1>
        <p className="text-sm text-gray-600">Files uploaded by this teacher for your class/batch</p>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-500">Loading uploads…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {!loading && !error && uploads.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No uploads found from this teacher.
        </div>
      )}

      <div className="space-y-4">
        {uploads.map((upload) => (
          <div key={upload._id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{upload.fileName}</div>
                <div className="text-sm text-gray-500">
                  {upload.type === 'batch' ? 'Common for batch' : 'Personal upload'} • 
                  Class {upload.class} • Batch {upload.batch} • 
                  {new Date(upload.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(upload.fileUrl, upload.fileName)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(upload._id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeacherUploads