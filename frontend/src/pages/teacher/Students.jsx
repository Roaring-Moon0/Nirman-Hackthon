import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../utils/constants";
import {
  Users,
  Search,
  AlertTriangle,
  FileText,
  TrendingUp,
  Mail,
} from "lucide-react";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";

const TeacherStudents = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, atRisk: 0, avgAttendance: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchClasses();
  }, [token]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/teacher/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Normalize structure if needed, depends on getTeacherClasses return
      const cls = res.data.classes || [];
      setClasses(cls);
      if (cls.length > 0) {
        setSelectedClassId(cls[0].class._id); // Default select first class
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch classes", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedClassId) return;
    fetchStudents(selectedClassId);
  }, [selectedClassId, token]);

  const fetchStudents = async (classId) => {
    try {
      setLoading(true);

      const selectedClassObj = classes.find((c) => c.class._id === classId);
      const subjectId = selectedClassObj ? selectedClassObj.subject._id : null;

      if (!subjectId) return; // Should not happen

      const res = await axios.get(
        `${API_BASE_URL}/api/attendance/class-report`,
        {
          params: { classId, subjectId },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const studentList = res.data.attendanceReport || [];

      // Calculate basic stats
      const total = studentList.length;
      const avgAtt =
        studentList.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
        (total || 1);
      const riskCount = studentList.filter(
        (s) => (s.percentage || 100) < 75,
      ).length; // Simple risk metric for now

      setStudents(studentList);
      setStats({
        total,
        atRisk: riskCount,
        avgAttendance: avgAtt,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading && classes.length === 0)
    return <Loader text="Loading your students..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-500">Manage and monitor student progress</p>
        </div>

        {classes.length > 0 && (
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-500 pl-2">
              Class:
            </span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer"
            >
              {classes.map((item, idx) => (
                <option key={idx} value={item.class._id}>
                  {item.class.classCode} ({item.subject.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">At Risk (Low Att.)</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.atRisk}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg. Attendance</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats.avgAttendance.toFixed(1)}%
            </h3>
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Attendance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const attendance = student.percentage || 0;
                  const isRisk = attendance < 75;

                  return (
                    <tr
                      key={student.studentId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {student.rollNo}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isRisk ? "bg-red-500" : "bg-green-500"}`}
                              style={{ width: `${attendance}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {attendance.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isRisk ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <AlertTriangle size={12} /> At Risk
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            Good Standing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudents;
