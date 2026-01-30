import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL, ENDPOINTS } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import RiskBar from "../../components/RiskBar";
import RiskBadge from "../../components/RiskBadge";
import {
  Clock,
  Award,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Calendar,
} from "lucide-react";

import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}${ENDPOINTS.STUDENT_DASHBOARD}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 401) logout();
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token, logout]);

  if (loading)
    return <Loader fullScreen text="Loading dashboard insights..." />;
  if (error)
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    );

  const { student, metrics, pendingAssignments } = data || {};

  return (
    <div className="space-y-6">
      {/* 1. Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Attendance"
          value={`${metrics?.attendance?.percentage || 0}%`}
          subtext="Total Classes: 45"
          trend="up"
          colorString="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Award}
          label="Performance"
          value={`${metrics?.marks?.average || 0}%`}
          subtext="Last Exam: Mid-Term"
          trend={metrics?.marks?.average > 75 ? "up" : "down"}
          colorString="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Risk Level"
          value={metrics?.risk?.level || "Low"}
          subtext="AI Assessment"
          colorString="bg-orange-50 text-orange-600"
        />
        <StatCard
          icon={BookOpen}
          label="Pending Tasks"
          value={metrics?.assignments?.pending || 0}
          subtext="Due this week"
          colorString="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 2. My Academic Status (Risk Profile) */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              My Academic Status
            </h2>
            <RiskBadge level={metrics?.risk?.level} />
          </div>

          {/* Table-like row for the student themself */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {student?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{student?.name}</p>
                  <p className="text-xs text-gray-500">{student?.rollNumber}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Risk Score
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">
                    {metrics?.risk?.score}/100
                  </span>
                  <div className="w-24">
                    <RiskBar
                      level={metrics?.risk?.level}
                      score={metrics?.risk?.score}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Attendance
                </p>
                <p className="font-bold text-gray-900">
                  {metrics?.attendance?.percentage}%
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Last Grade
                </p>
                <p className="font-bold text-gray-900">A (85%)</p>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
            AI Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics?.risk?.factors?.length > 0 ? (
              metrics.risk.factors.map((factor, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 bg-orange-50/50 rounded-xl border border-orange-100"
                >
                  <AlertTriangle size={18} className="text-orange-500 mt-0.5" />
                  <p className="text-sm text-gray-700">{factor}</p>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle2 size={18} className="text-green-600" />
                <p className="text-sm text-green-700 text-center w-full">
                  Great job! No major risk factors detected.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Upcoming Tasks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Upcoming Tasks
          </h2>

          <div className="space-y-3">
            {pendingAssignments?.length > 0 ? (
              pendingAssignments.slice(0, 4).map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 cursor-pointer"
                >
                  <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                    <BookOpen size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-lg whitespace-nowrap">
                    Due Soon
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500">No pending tasks!</p>
              </div>
            )}
          </div>

          {pendingAssignments?.length > 0 && (
            <button className="w-full mt-6 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              View All Tasks
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
