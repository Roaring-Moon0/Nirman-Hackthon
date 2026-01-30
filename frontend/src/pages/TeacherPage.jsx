import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, ENDPOINTS } from "../utils/constants";
import {
  LogOut,
  Users,
  AlertCircle,
  TrendingUp,
  BookOpen,
  UserCheck,
} from "lucide-react";

const TeacherPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}${ENDPOINTS.TEACHER_DASHBOARD}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setDashboardData(response.data);
      } catch (err) {
        console.error("Teacher dashboard fetch error:", err);
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
        } else {
          setError("Failed to load dashboard data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token, logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { teacher, classes } = dashboardData || {};

  // Aggregate silent struggles
  const allSilentStruggles =
    classes?.flatMap((c) =>
      c.riskSummary.silentStruggleAlerts.map((alert) => ({
        ...alert,
        className: c.class.classCode,
      })),
    ) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome, {teacher?.name}!
            </h1>
            <p className="text-gray-500">
              {teacher?.department} • ID: {teacher?.employeeId}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-100"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Urgent Alerts Section */}
        {allSilentStruggles.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 text-red-700">
              <AlertCircle size={24} />
              <h2 className="text-lg font-bold">Silent Struggle Alerts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSilentStruggles.map((alert, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm"
                >
                  <p className="font-bold text-gray-900">{alert.name}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Class: {alert.className}
                  </p>
                  <p className="text-sm text-red-700 bg-red-50 p-2 rounded">
                    "{alert.reason}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classes Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="text-purple-600" />
            Your Classes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {classes?.length > 0 ? (
              classes.map((c, idx) => <ClassCard key={idx} classData={c} />)
            ) : (
              <p className="text-gray-500 col-span-full italic">
                No classes assigned yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClassCard = ({ classData }) => {
  const { class: classInfo, subject, totalStudents, riskSummary } = classData;
  const highRisk = riskSummary?.highRisk || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {classInfo.classCode}
            </h3>
            <p className="text-sm text-purple-600 font-medium">
              {subject.subjectName}
            </p>
          </div>
          <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
            {classInfo.section
              ? `Sec ${classInfo.section}`
              : "Year " + classInfo.year}
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} />
            <span className="text-sm font-medium">
              {totalStudents} Students
            </span>
          </div>
          {highRisk > 0 && (
            <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">
              <AlertCircle size={14} />
              {highRisk} High Risk
            </div>
          )}
        </div>

        {/* Risk Distribution Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Class Risk Profile</span>
            <span>
              {((riskSummary?.lowRisk / totalStudents) * 100).toFixed(0)}%
              Healthy
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              style={{
                width: `${(riskSummary.lowRisk / totalStudents) * 100}%`,
              }}
              className="bg-green-500 h-full"
            ></div>
            <div
              style={{
                width: `${(riskSummary.mediumRisk / totalStudents) * 100}%`,
              }}
              className="bg-yellow-400 h-full"
            ></div>
            <div
              style={{
                width: `${(riskSummary.highRisk / totalStudents) * 100}%`,
              }}
              className="bg-red-500 h-full"
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
        <button className="text-purple-600 text-sm font-semibold hover:text-purple-700">
          View Details
        </button>
        <button className="text-gray-400 hover:text-gray-600">
          <TrendingUp size={18} />
        </button>
      </div>
    </div>
  );
};

export default TeacherPage;
