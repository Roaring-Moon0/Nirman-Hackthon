import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar,
  Save,
  CheckCircle,
  XCircle,
  Users,
  AlertCircle,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";

const TeacherAttendance = () => {
  const { token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Teacher's Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/teacher/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Adapt response structure depending on controller
        // Expecting { classes: [...] } where class object has classId or _id
        const classList = res.data.classes || [];
        // Flatten structure if needed (based on previous edits): "classes" array of { class, subject, students }
        const formatted = classList.map((item) => ({
          id: item.class?._id || item._id, // Handle populated structure
          name: item.class?.classCode || item.classCode,
          section: item.class?.section || item.section,
          subject: item.subject?.subjectName,
        }));
        setClasses(formatted);
      } catch (err) {
        toast.error("Failed to load assigned classes");
      }
    };
    if (token) fetchClasses();
  }, [token]);

  // 2. Fetch Attendance for Selected Class & Date
  const fetchAttendance = async () => {
    if (!selectedClass || !date) return;

    try {
      setLoadingStudents(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/attendance/teacher/${selectedClass}?date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Initialize status: use existing or default to 'present' if not marked
      const fetchedStudents = res.data.students.map((s) => ({
        ...s,
        status: s.status || "present", // Default present for easier marking
      }));

      setStudents(fetchedStudents);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load student list");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedClass && date) {
      fetchAttendance();
    }
  }, [selectedClass, date]);

  // 3. Toggle Status
  const toggleStatus = (studentId) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId
          ? { ...s, status: s.status === "present" ? "absent" : "present" }
          : s,
      ),
    );
  };

  // 4. Submit Attendance
  const handleSubmit = async () => {
    try {
      setSaving(true);
      const payload = {
        date,
        records: students.map((s) => ({
          studentId: s.studentId,
          status: s.status,
        })),
      };

      await axios.post(
        `${API_BASE_URL}/api/attendance/teacher/${selectedClass}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Attendance saved successfully! 🎓");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.length - presentCount;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-purple-600" /> Mark Attendance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Select class and date to manage attendance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Class Selector */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="pl-4 pr-10 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-gray-700 font-medium"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section ? `(Sec ${c.section})` : ""}{" "}
                  {c.subject ? `- ${c.subject}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={date}
            max={new Date().toISOString().split("T")[0]} // No future attendance
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-gray-700 font-medium"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {selectedClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Summary Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl text-green-700">
                  <span className="flex items-center gap-2 font-medium">
                    <CheckCircle size={18} /> Present
                  </span>
                  <span className="font-bold text-xl">{presentCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl text-red-700">
                  <span className="flex items-center gap-2 font-medium">
                    <XCircle size={18} /> Absent
                  </span>
                  <span className="font-bold text-xl">{absentCount}</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-600">
                  <span>Total Students</span>
                  <span className="font-bold">{students.length}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={saving || loadingStudents || students.length === 0}
                className={`mt-6 w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all
                            ${saving ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 hover:shadow-purple-300"}
                        `}
              >
                {saving ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Save size={20} />
                )}
                {saving ? "Saving..." : "Submit Attendance"}
              </button>
              {!students.length && !loadingStudents && (
                <p className="text-xs text-center text-red-400 mt-2">
                  No students found in this class.
                </p>
              )}
            </div>
          </div>

          {/* Right: Student List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Users size={18} className="text-gray-500" /> Student List
                </h3>
                <span className="text-xs text-gray-500 italic">
                  Tap status to toggle
                </span>
              </div>

              {loadingStudents ? (
                <div className="p-10 text-center text-gray-400">
                  Loading student list...
                </div>
              ) : students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase">
                        <th className="p-4 font-medium">Roll No</th>
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium text-center">Status</th>
                        <th className="p-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {students.map((student) => (
                        <tr
                          key={student.studentId}
                          className={`hover:bg-gray-50 transition-colors ${student.status === "absent" ? "bg-red-50/30" : ""}`}
                        >
                          <td className="p-4 font-medium text-gray-900">
                            {student.rollNo}
                          </td>
                          <td className="p-4 text-gray-700">{student.name}</td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-all
                                                        ${
                                                          student.status ===
                                                          "present"
                                                            ? "bg-green-100 text-green-700 border border-green-200"
                                                            : "bg-red-100 text-red-700 border border-red-200"
                                                        }
                                                    `}
                              onClick={() => toggleStatus(student.studentId)}
                            >
                              {student.status === "present" ? (
                                <CheckCircle size={12} />
                              ) : (
                                <XCircle size={12} />
                              )}
                              {student.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => toggleStatus(student.studentId)}
                              className="text-xs font-medium text-purple-600 hover:text-purple-800 underline"
                            >
                              Change
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-10 text-center text-gray-400">
                  <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                  <p>No students found for this class.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No Class Selected</h3>
          <p className="text-gray-500">
            Please select a class from the dropdown above to manage attendance.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
