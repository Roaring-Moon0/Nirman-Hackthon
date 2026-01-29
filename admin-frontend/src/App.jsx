import React, { useState, useEffect } from 'react'
import AdminGate from './components/AdminGate'
import AdminDashboard from './pages/AdminDashboard'
import { ADMIN_KEY_STORAGE } from './utils/constants'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if admin key exists in sessionStorage
    const adminKey = sessionStorage.getItem(ADMIN_KEY_STORAGE)
    if (adminKey) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  return (
    <>
      {isAuthenticated ? (
        <AdminDashboard />
      ) : (
        <AdminGate onAuthenticated={handleAuthenticated} />
      )}
    </>
  )
}

export default App
