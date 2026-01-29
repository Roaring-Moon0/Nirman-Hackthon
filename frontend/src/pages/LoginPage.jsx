import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/Input'
import Button from '../components/Button'
import { ROLES } from '../utils/constants'

const LoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    role: ROLES.STUDENT
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Store mock user data
    localStorage.setItem('user', JSON.stringify({ role: formData.role, loginId: formData.loginId }))
    localStorage.setItem('token', 'mock-jwt-token')
    
    // Navigate based on role
    if (formData.role === ROLES.ADMIN) navigate('/admin')
    else if (formData.role === ROLES.TEACHER) navigate('/teacher')
    else navigate('/student')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2">NIRMAN</h1>
          <p className="text-purple-200 text-lg">Education Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-purple-200 mb-3">Select Role</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(ROLES).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`
                      py-3 px-4 rounded-lg font-semibold capitalize transition-all duration-200
                      ${formData.role === role 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'bg-white/10 text-purple-200 hover:bg-white/20'
                      }
                    `}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Login ID */}
            <div className="mb-4">
              <Input
                label="Login ID"
                type="text"
                placeholder="Enter your login ID"
                value={formData.loginId}
                onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-purple-300 text-sm mt-6">
            Demo credentials: Any ID/Password works
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-purple-300 text-sm mt-6">
          © 2026 Nirman Hackathon
        </p>
      </div>
    </div>
  )
}

export default LoginPage
