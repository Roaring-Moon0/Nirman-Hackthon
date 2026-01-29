import React, { useState } from 'react'
import axiosInstance from '../api/axios'
import { API_ENDPOINTS, ADMIN_KEY_STORAGE } from '../utils/constants'

const AdminGate = ({ onAuthenticated }) => {
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Store key temporarily in sessionStorage
      sessionStorage.setItem(ADMIN_KEY_STORAGE, adminKey)
      
      // Validate by calling ping endpoint
      await axiosInstance.get(API_ENDPOINTS.ADMIN_PING)
      
      // If successful, notify parent
      onAuthenticated()
    } catch (err) {
      // Remove invalid key
      sessionStorage.removeItem(ADMIN_KEY_STORAGE)
      setError('Invalid admin key. Access denied.')
      setAdminKey('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-gate">
      <div className="admin-gate-card">
        <h1>🔐 Admin Access</h1>
        <p>Enter the admin key to access the admin panel</p>
        
        {error && (
          <div className="message message-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Key <span>*</span></label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              required
              autoFocus
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading || !adminKey}
          >
            {loading ? 'Validating...' : 'Access Admin Panel'}
          </button>
        </form>

        <div className="info-box" style={{ marginTop: '20px' }}>
          <strong>Security Notice:</strong>
          This admin panel is protected by an admin key. Access is logged and monitored.
          Your session will expire when you close the browser.
        </div>
      </div>
    </div>
  )
}

export default AdminGate
