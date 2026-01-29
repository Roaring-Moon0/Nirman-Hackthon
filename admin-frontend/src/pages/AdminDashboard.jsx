import React, { useState } from 'react'
import AdminCard from '../components/AdminCard'
import AdminForm from '../components/AdminForm'
import axiosInstance from '../api/axios'
import { API_ENDPOINTS, FORM_FIELDS, ADMIN_KEY_STORAGE } from '../utils/constants'

const AdminDashboard = () => {
  const [messages, setMessages] = useState({})
  const [loading, setLoading] = useState({})

  const showMessage = (section, type, text) => {
    setMessages({ ...messages, [section]: { type, text } })
    setTimeout(() => {
      setMessages((prev) => {
        const newMessages = { ...prev }
        delete newMessages[section]
        return newMessages
      })
    }, 5000)
  }

  const handleSubmit = async (section, endpoint, data) => {
    setLoading({ ...loading, [section]: true })
    try {
      const response = await axiosInstance.post(endpoint, data)
      showMessage(section, 'success', response.data.message || 'Successfully added!')
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add. Please try again.'
      showMessage(section, 'error', errorMsg)
    } finally {
      setLoading({ ...loading, [section]: false })
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE)
    window.location.reload()
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>Admin Panel</h1>
            <p>Nirman Education Management System</p>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="info-box">
          <strong>Default Credentials:</strong>
          All students and teachers are created with the default password: <code>college@123</code>
        </div>

        <div className="admin-grid">
          {/* Add Class */}
          <AdminCard title="➕ Add Class">
            {messages.class && (
              <div className={`message message-${messages.class.type}`}>
                {messages.class.text}
              </div>
            )}
            <AdminForm
              fields={FORM_FIELDS.CLASS}
              onSubmit={(data) => handleSubmit('class', API_ENDPOINTS.ADD_CLASS, data)}
              submitText="Add Class"
              loading={loading.class}
            />
          </AdminCard>

          {/* Add Subject */}
          <AdminCard title="📚 Add Subject">
            {messages.subject && (
              <div className={`message message-${messages.subject.type}`}>
                {messages.subject.text}
              </div>
            )}
            <AdminForm
              fields={FORM_FIELDS.SUBJECT}
              onSubmit={(data) => handleSubmit('subject', API_ENDPOINTS.ADD_SUBJECT, data)}
              submitText="Add Subject"
              loading={loading.subject}
            />
          </AdminCard>

          {/* Add Student */}
          <AdminCard title="🎓 Add Student">
            {messages.student && (
              <div className={`message message-${messages.student.type}`}>
                {messages.student.text}
              </div>
            )}
            <AdminForm
              fields={FORM_FIELDS.STUDENT}
              onSubmit={(data) => handleSubmit('student', API_ENDPOINTS.ADD_STUDENT, data)}
              submitText="Add Student"
              loading={loading.student}
            />
          </AdminCard>

          {/* Add Teacher */}
          <AdminCard title="👨‍🏫 Add Teacher">
            {messages.teacher && (
              <div className={`message message-${messages.teacher.type}`}>
                {messages.teacher.text}
              </div>
            )}
            <AdminForm
              fields={FORM_FIELDS.TEACHER}
              onSubmit={(data) => handleSubmit('teacher', API_ENDPOINTS.ADD_TEACHER, data)}
              submitText="Add Teacher"
              loading={loading.teacher}
            />
          </AdminCard>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
