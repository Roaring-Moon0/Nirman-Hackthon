import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

const TeacherPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-purple-100 mt-1">Welcome back, Prof. Smith</p>
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
            { label: 'My Classes', value: '5', icon: '📚', color: 'bg-blue-500' },
            { label: 'Total Students', value: '142', icon: '🎓', color: 'bg-green-500' },
            { label: 'Pending Assignments', value: '12', icon: '📝', color: 'bg-orange-500' },
            { label: 'Attendance Today', value: '95%', icon: '✅', color: 'bg-purple-500' }
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
              {['dashboard', 'assignments', 'attendance', 'grades'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-4 px-6 font-semibold capitalize transition-all duration-200 border-b-2
                    ${activeTab === tab 
                      ? 'border-purple-600 text-purple-600' 
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
                {/* My Classes */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">My Classes</h3>
                  <div className="space-y-3">
                    {['Class 10-A - Mathematics', 'Class 10-B - Mathematics', 'Class 11-A - Physics'].map((cls, i) => (
                      <div key={i} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                        <p className="font-semibold text-gray-800">{cls}</p>
                        <p className="text-sm text-gray-600 mt-1">Students: {30 + i * 5} • Next class: Today 2:00 PM</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Tasks */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Tasks</h3>
                  <div className="space-y-3">
                    {[
                      { task: 'Grade Assignment 5', due: 'Due in 2 days', priority: 'high' },
                      { task: 'Prepare Quiz 3', due: 'Due in 5 days', priority: 'medium' },
                      { task: 'Update Attendance', due: 'Due today', priority: 'high' }
                    ].map((item, i) => (
                      <div key={i} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">{item.task}</p>
                            <p className="text-sm text-gray-500">{item.due}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.priority.toUpperCase()}
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Assignment Management</h3>
                  <Button variant="primary" size="sm">Create New Assignment</Button>
                </div>
                <div className="space-y-4">
                  {[
                    { title: 'Algebra Chapter 5 Problems', class: 'Class 10-A', submissions: '28/30', dueDate: 'Jan 30' },
                    { title: 'Physics Lab Report', class: 'Class 11-A', submissions: '15/35', dueDate: 'Feb 2' },
                    { title: 'Calculus Assignment', class: 'Class 10-B', submissions: '30/32', dueDate: 'Jan 28' }
                  ].map((assignment, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-800 mb-2">{assignment.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              📚 {assignment.class}
                            </span>
                            <span className="flex items-center gap-1">
                              📊 {assignment.submissions} submitted
                            </span>
                            <span className="flex items-center gap-1">
                              📅 Due: {assignment.dueDate}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View Submissions</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Mark Attendance</h3>
                  <select className="px-4 py-2 border-2 border-gray-200 rounded-lg font-medium focus:border-purple-500 outline-none">
                    <option>Class 10-A</option>
                    <option>Class 10-B</option>
                    <option>Class 11-A</option>
                  </select>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown', 'Diana Prince'].map((student, i) => (
                      <div key={i} className="bg-white rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                            {student.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{student}</p>
                            <p className="text-xs text-gray-500">Roll No: {1001 + i}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">P</button>
                          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">A</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button variant="success" size="md">Submit Attendance</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'grades' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Grade Management</h3>
                  <select className="px-4 py-2 border-2 border-gray-200 rounded-lg font-medium focus:border-purple-500 outline-none">
                    <option>Class 10-A - Mathematics</option>
                    <option>Class 10-B - Mathematics</option>
                    <option>Class 11-A - Physics</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-xl overflow-hidden">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Student Name</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Roll No</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Assignment 1</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Assignment 2</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Mid-Term</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['John Doe', 'Jane Smith', 'Bob Johnson'].map((student, i) => (
                        <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6 font-medium text-gray-800">{student}</td>
                          <td className="py-4 px-6 text-gray-600">{1001 + i}</td>
                          <td className="py-4 px-6">
                            <input type="number" className="w-16 px-2 py-1 border border-gray-300 rounded" defaultValue={85 + i * 2} />
                          </td>
                          <td className="py-4 px-6">
                            <input type="number" className="w-16 px-2 py-1 border border-gray-300 rounded" defaultValue={90 - i} />
                          </td>
                          <td className="py-4 px-6">
                            <input type="number" className="w-16 px-2 py-1 border border-gray-300 rounded" defaultValue={88 + i} />
                          </td>
                          <td className="py-4 px-6 font-bold text-purple-600">{263 + i}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button variant="primary" size="md">Save Grades</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherPage
