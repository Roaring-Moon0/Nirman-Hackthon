import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, ENDPOINTS } from "../utils/constants";
import { GraduationCap, Users, Lock, LogIn, AlertCircle } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    role: "student",
    loginId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔵 Attempting Login:", {
        url: `${API_BASE_URL}${ENDPOINTS.LOGIN}`,
        role: formData.role,
        loginId: formData.loginId,
        password: "***",
      });

      const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
        loginId: formData.loginId,
        password: formData.password,
      });

      const { token, role, ...profile } = response.data;

      // Flatten profile for context
      const userForContext = {
        role,
        name: profile.name,
        // If classId is populated object, use name, else use id or fallback
        className: profile.classId?.name || profile.classId || "Class N/A",
        ...profile,
      };

      // Save to AuthContext (which saves to localStorage)
      login(userForContext, token);

      // Navigate based on role
      if (role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    } catch (err) {
      console.error("🔴 Login Error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
      setLoading(false);
    }
  };

  const getRoleIcon = () =>
    formData.role === "student" ? (
      <GraduationCap size={20} />
    ) : (
      <Users size={20} />
    );
  const getLoginIdLabel = () =>
    formData.role === "student" ? "Roll Number" : "Employee ID";
  const getLoginIdPlaceholder = () =>
    formData.role === "student" ? "e.g.S001" : "e.g. T001";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <LogIn size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Academic ERP System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Login As
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  {getRoleIcon()}
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            </div>

            {/* Login ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {getLoginIdLabel()}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="loginId"
                  value={formData.loginId}
                  onChange={handleInputChange}
                  placeholder={getLoginIdPlaceholder()}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <AlertCircle size={20} className="text-red-600" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            © 2024 Academic ERP
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
