import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_BASE_URL, ENDPOINTS } from "../../utils/constants";
import { Users, AlertCircle, BookOpen, Clock, Calendar } from "lucide-react";

const TeacherDashboard = () => {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchDashboard();
  }, [token]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
    );

  const { teacher, classes } = dashboardData || {};
  const allSilentStruggles =
    classes?.flatMap((c) =>
      (c.riskSummary?.silentStruggleAlerts || []).map((alert) => ({
        ...alert,
        className: c.class.classCode,
      })),
    ) || [];

  return (
    <div className="space-y-8">
      {/* 1. Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="At-Risk Students"
          value={allSilentStruggles.length}
          icon={AlertCircle}
          color="text-red-600"
          bg="bg-red-50"
        />
        <SummaryCard
          title="Total Classes"
          value={classes?.length || 0}
          icon={BookOpen}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <SummaryCard
          title="Pending Tasks"
          value="5"
          icon={Clock}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <SummaryCard
          title="Today's Classes"
          value="2"
          icon={Calendar}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* 2. Silent Struggle Alerts */}
      {allSilentStruggles.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-red-700">
            <AlertCircle size={24} />
            <h2 className="text-lg font-bold">Priority Attention Needed</h2>
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

      {/* 3. Classes Overview */}
      <h2 className="text-xl font-bold text-gray-900">Your Classes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {classes?.map((c, idx) => (
          <ClassCard key={idx} classData={c} />
        ))}
      </div>
    </div>
  );
};

const SummaryCard = (
  { title, value, icon: Icon, color, bg }, // Corrected destructuring
) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ClassCard = ({ classData }) => {
  const { class: classInfo, subject, totalStudents, riskSummary } = classData; // Renamed class to classInfo
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{classInfo.classCode}</h3>
          <p className="text-purple-600 text-sm">{subject.subjectName}</p>
        </div>
        <span className="bg-purple-50 text-purple-700 font-bold text-xs px-2 py-1 rounded-full h-fit">
          {classInfo.section}
        </span>
      </div>
      <div className="flex gap-4 text-sm text-gray-600 mb-4">
        <span className="flex items-center gap-1">
          <Users size={16} /> {totalStudents} Students
        </span>
        {riskSummary.highRisk > 0 && (
          <span className="flex items-center gap-1 text-red-600 font-bold">
            <AlertCircle size={16} /> {riskSummary.highRisk} Risk
          </span>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
