import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

const StudentPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Portal</h1>
            <p className="text-blue-100 mt-1">Welcome back, John Doe • Class 10-A</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Attendance', value: '92%', icon: '✅', color: 'bg-green-500' },
            { label: 'Average Grade', value: 'A-', icon: '📊', color: 'bg-blue-500' },
            { label: 'Pending Assignments', value: '3', icon: '📝', color: 'bg-orange-500' },
            { label: 'Upcoming Tests', value: '2', icon: '📚', color: 'bg-purple-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl mb-3`}>
                {stat.icon}
              </div>
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              {['dashboard', 'assignments', 'grades', 'attendance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-4 px-6 font-semibold capitalize transition-all duration-200 border-b-2
                    ${activeTab === tab 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Schedule</h3>
                  <div className="space-y-3">
                    {[
                      { subject: 'Mathematics', time: '9:00 AM - 10:00 AM', teacher: 'Prof. Smith' },
                      { subject: 'Physics', time: '10:15 AM - 11:15 AM', teacher: 'Prof. Johnson' },
                      { subject: 'Chemistry', time: '11:30 AM - 12:30 PM', teacher: 'Prof. Williams' }
                    ].map((cls, i) => (
                      <div key={i} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800">{cls.subject}</p>
                            <p className="text-sm text-gray-600">{cls.teacher}</p>
                          </div>
                          <span className="text-sm font-medium text-blue-600">{cls.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Announcements */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Announcements</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'Mid-term exams schedule released', date: 'Today', type: 'important' },
                      { title: 'Science fair registration open', date: 'Yesterday', type: 'info' },
                      { title: 'Library books due next week', date: '2 days ago', type: 'reminder' }
                    ].map((announcement, i) => (
                      <div key={i} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{announcement.title}</p>
                            <p className="text-sm text-gray-500 mt-1">{announcement.date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            announcement.type === 'important' ? 'bg-red-100 text-red-700' :
                            announcement.type === 'info' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {announcement.type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">My Assignments</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Algebra Chapter 5 Problems', subject: 'Mathematics', dueDate: 'Jan 30', status: 'pending', points: 100 },
                    { title: 'Physics Lab Report', subject: 'Physics', dueDate: 'Feb 2', status: 'pending', points: 50 },
                    { title: 'English Essay', subject: 'English', dueDate: 'Jan 25', status: 'submitted', points: 75, score: 68 },
                    { title: 'Chemistry Worksheet', subject: 'Chemistry', dueDate: 'Jan 20', status: 'graded', points: 50, score: 45 }
                  ].map((assignment, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-800 mb-2">{assignment.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              📚 {assignment.subject}
                            </span>
                            <span className="flex items-center gap-1">
                              📅 Due: {assignment.dueDate}
                            </span>
                            <span className="flex items-center gap-1">
                              🎯 {assignment.points} points
                            </span>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          assignment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          assignment.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {assignment.status.toUpperCase()}
                        </span>
                      </div>
                      {assignment.status === 'graded' && (
                        <div className="bg-green-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-semibold text-green-800">
                            Score: {assignment.score}/{assignment.points} ({Math.round((assignment.score / assignment.points) * 100)}%)
                          </p>
                        </div>
                      )}
                      <div className="flex gap-3">
                        {assignment.status === 'pending' && (
                          <Button variant="primary" size="sm">Submit Assignment</Button>
                        )}
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'grades' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">My Grades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { subject: 'Mathematics', grade: 'A', percentage: 92, assignments: 8, tests: 3 },
                    { subject: 'Physics', grade: 'A-', percentage: 88, assignments: 6, tests: 2 },
                    { subject: 'Chemistry', grade: 'B+', percentage: 85, assignments: 7, tests: 2 },
                    { subject: 'English', grade: 'A', percentage: 91, assignments: 5, tests: 2 },
                    { subject: 'Biology', grade: 'B', percentage: 82, assignments: 6, tests: 2 },
                    { subject: 'History', grade: 'A-', percentage: 87, assignments: 4, tests: 2 }
                  ].map((subject, i) => (
                    <div key={i} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-800">{subject.subject}</h4>
                        <div className="text-right">
                          <p className="text-3xl font-black text-blue-600">{subject.grade}</p>
                          <p className="text-sm text-gray-500">{subject.percentage}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📝 {subject.assignments} assignments</span>
                        <span>📊 {subject.tests} tests</span>
                      </div>
                      <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${subject.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Attendance Record</h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Overall Attendance</p>
                      <p className="text-4xl font-black text-green-600">92%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Present: 165 days</p>
                      <p className="text-sm text-gray-600">Absent: 15 days</p>
                      <p className="text-sm text-gray-600">Total: 180 days</p>
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-gray-800 mb-4">Subject-wise Attendance</h4>
                <div className="space-y-3">
                  {[
                    { subject: 'Mathematics', present: 42, total: 45, percentage: 93 },
                    { subject: 'Physics', present: 38, total: 42, percentage: 90 },
                    { subject: 'Chemistry', present: 40, total: 43, percentage: 93 },
                    { subject: 'English', present: 44, total: 45, percentage: 98 },
                    { subject: 'Biology', present: 39, total: 44, percentage: 89 }
                  ].map((subject, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-800">{subject.subject}</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          subject.percentage >= 90 ? 'bg-green-100 text-green-700' :
                          subject.percentage >= 75 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {subject.percentage}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{subject.present}/{subject.total} classes attended</p>
                      <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            subject.percentage >= 90 ? 'bg-green-500' :
                            subject.percentage >= 75 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${subject.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentPage
