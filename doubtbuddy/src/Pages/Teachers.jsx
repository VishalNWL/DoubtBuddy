import React, { useEffect, useState } from 'react'
import Axios from '../Utils/Axios'
import SummaryAPi from '../Common/SummaryApi'
import { useNavigate } from 'react-router-dom'

function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await Axios({
          ...SummaryAPi.teachersForStudent
        })

        setTeachers(res?.data?.data || [])
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load teachers')
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [])

  const handleTeacherClick = (teacherId) => {
    navigate(`/teacher-uploads/${teacherId}`)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold">My Teachers</h1>
        <p className="text-sm text-gray-600">Click on a teacher to view their uploads</p>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-500">Loading teachers…</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {!loading && !error && teachers.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No teachers found.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <button
            key={teacher._id}
            type="button"
            onClick={() => handleTeacherClick(teacher._id)}
            className="text-left bg-white border rounded-xl shadow-sm p-4 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-lg font-semibold text-green-700">
                {teacher.fullname?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{teacher.fullname}</div>
                <div className="text-sm text-gray-500">{teacher.email}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Teachers