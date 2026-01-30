import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import StatusBadge from "../../components/StatusBadge";
import {
  PieChart,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const Attendance = () => {
  const { token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, [token]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/student/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) logout();
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load attendance.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading attendance..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAttendance} />;

  const { metrics, history } = data || {};

  // Logic: Group history by subject to try and form subject-cards
  // LIMITATION: Backend might return "General" for all.
  const groupedBySubject = (history || []).reduce((acc, curr) => {
    const sub = curr.subject || "General Classes";
    if (!acc[sub]) {
      acc[sub] = { total: 0, present: 0, teacher: curr.teacher || "Unknown" };
    }
    acc[sub].total += 1;
    if (curr.status === "Present") acc[sub].present += 1;
    return acc;
  }, {});

  const hasData = history && history.length > 0;

  if (!hasData)
    return <EmptyState message="No attendance records available yet." />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>

      {/* Overview Cards (Overall) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <PieChart size={28} />
          </div>
          <div>
            <p className="text-gray-500 font-medium">Overall Attendance</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics?.percentage || 0}%
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-gray-500 font-medium">Classes Attended</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics?.presentClasses || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-pink-100 text-pink-600 rounded-full">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-gray-500 font-medium">Total Classes</p>
            <p className="text-3xl font-bold text-gray-900">
              {metrics?.totalClasses || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Subject Wise List */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Subject Wise Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedBySubject).map(([sub, stats], i) => {
            const pct =
              stats.total > 0
                ? Math.round((stats.present / stats.total) * 100)
                : 0;
            let status = "Good";
            let color = "text-green-600";
            let bg = "bg-green-100";

            if (pct < 75) {
              status = "Critical";
              color = "text-red-600";
              bg = "bg-red-100";
            } else if (pct < 85) {
              status = "Warning";
              color = "text-yellow-600";
              bg = "bg-yellow-100";
            }

            return (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{sub}</h3>
                    <p className="text-sm text-gray-500">
                      Teacher: {stats.teacher}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${bg} ${color}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {pct}%
                  </span>
                  <div className="text-xs text-gray-500">
                    <p>Attended: {stats.present}</p>
                    <p>Total: {stats.total}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${pct < 75 ? "bg-red-500" : "bg-green-500"}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
