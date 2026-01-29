import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'

const AdminPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const stats = [
    { label: 'Total Students', value: '1,234', icon: '🎓', color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Teachers', value: '87', icon: '👨‍🏫', color: 'from-purple-500 to-pink-500' },
    { label: 'Total Classes', value: '45', icon: '📚', color: 'from-green-500 to-emerald-500' },
    { label: 'Total Subjects', value: '28', icon: '📖', color: 'from-orange-500 to-red-500' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your education system</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-3xl mb-4`}>
                {stat.icon}
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              {['dashboard', 'users', 'classes', 'subjects'].map((tab) => (
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
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: 'New student registered', user: 'John Doe', time: '2 hours ago' },
                    { action: 'Class schedule updated', user: 'Admin', time: '5 hours ago' },
                    { action: 'New teacher added', user: 'Jane Smith', time: '1 day ago' }
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-800">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.user}</p>
                      </div>
                      <span className="text-sm text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">User Management</h3>
                  <Button variant="primary" size="sm">Add New User</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'John Doe', role: 'Student', status: 'Active' },
                        { name: 'Jane Smith', role: 'Teacher', status: 'Active' },
                        { name: 'Bob Johnson', role: 'Student', status: 'Inactive' }
                      ].map((user, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-800">{user.name}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="text-purple-600 hover:text-purple-800 font-medium">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'classes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Class Management</h3>
                  <Button variant="primary" size="sm">Add New Class</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['Class 10-A', 'Class 10-B', 'Class 11-A', 'Class 11-B', 'Class 12-A', 'Class 12-B'].map((className, i) => (
                    <div key={i} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 hover:shadow-lg transition-shadow">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">{className}</h4>
                      <p className="text-sm text-gray-600 mb-4">Students: {Math.floor(Math.random() * 50) + 20}</p>
                      <Button variant="outline" size="sm" className="w-full">View Details</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'subjects' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Subject Management</h3>
                  <Button variant="primary" size="sm">Add New Subject</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'].map((subject, i) => (
                    <div key={i} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">{subject}</h4>
                          <p className="text-sm text-gray-500">Teachers: {Math.floor(Math.random() * 5) + 1}</p>
                        </div>
                        <button className="text-purple-600 hover:text-purple-800 font-medium">Edit</button>
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

export default AdminPage
