import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../utils/constants";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Save,
  Loader2,
} from "lucide-react";

const TeacherAttendance = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState({
    today: new Date().toISOString().split("T")[0],
  });
  const [timetable, setTimetable] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // 1. Fetch Today's Timetable
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/attendance/today-timetable`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setTimetable(res.data.classes || []);
      } catch (err) {
        console.error("Failed to fetch timetable", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchTimetable();
  }, [token]);

  // 2. Fetch Students when Class Selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;
      try {
        setLoading(true);
        // We need an endpoint to get students of a class.
        // We can reuse /api/teacher/high-risk-students?classId=... or a new dedicated one.
        // Or generic /api/student/list?classId=...
        // Let's assume we use the endpoint that gives us students or we add one.
        // Checking routes... class-report gives students.
        const res = await axios.get(
          `${API_BASE_URL}/api/attendance/class-report`,
          {
            params: {
              classId: selectedClass.classId._id,
              subjectId: selectedClass.subjectId._id,
            },
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setStudents(res.data.attendanceReport || []); // Using report data which contains student info

        // Initialize attendance to PRESENT by default
        const initial = {};
        res.data.attendanceReport.forEach((s) => (initial[s.studentId] = true));
        setAttendanceState(initial);
      } catch (err) {
        console.error("Failed to fetch students", err);
        setMessage({ type: "error", text: "Failed to load student list" });
      } finally {
        setLoading(false);
      }
    };

    if (selectedClass) fetchStudents();
  }, [selectedClass, token]);

  const toggleAttendance = (studentId) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const attendanceRecords = Object.entries(attendanceState).map(
        ([studentId, isPresent]) => ({
          studentId,
          isPresent,
        }),
      );

      await axios.post(
        `${API_BASE_URL}/api/attendance/take`,
        {
          timetableId: selectedClass._id,
          classId: selectedClass.classId._id,
          subjectId: selectedClass.subjectId._id,
          date: dates.today,
          attendanceRecords,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMessage({
        type: "success",
        text: "Attendance submitted successfully!",
      });
      setSelectedClass(null); // Reset
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to submit attendance",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !selectedClass)
    return <div className="p-8 text-center">Loading timetable...</div>;

  // Lock check: Attendance can only be edited for today
  const now = new Date();
  const isToday = dates.today === now.toISOString().split("T")[0];
  const isLocked = !isToday; // Locked if viewing past dates

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <div className="flex items-center gap-2 text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100">
          <Calendar size={18} />
          <span>{new Date().toDateString()}</span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {message.text}
        </div>
      )}

      {/* View 1: Timetable List */}
      {!selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timetable.length > 0 ? (
            timetable.map((slot) => (
              <div
                key={slot._id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Clock size={24} />
                  </div>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  {slot.subjectId.subjectName}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Class {slot.classId.classCode} • {slot.classId.section}
                </p>
                <button
                  onClick={() => setSelectedClass(slot)}
                  className="w-full py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Take Attendance
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500">No classes scheduled for today.</p>
            </div>
          )}
        </div>
      ) : (
        /* View 2: Student List */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-xl text-gray-900">
                {selectedClass.subjectId.subjectName}
              </h2>
              <p className="text-gray-500">
                Marking attendance for {selectedClass.classId.classCode}
              </p>
            </div>
            <button
              onClick={() => setSelectedClass(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr
                    key={student.studentId}
                    className={
                      !attendanceState[student.studentId] ? "bg-red-50/30" : ""
                    }
                  >
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">
                      {student.rollNo}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          attendanceState[student.studentId]
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {attendanceState[student.studentId] ? (
                          <CheckCircle size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {attendanceState[student.studentId]
                          ? "Present"
                          : "Absent"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleAttendance(student.studentId)}
                        disabled={isLocked}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          attendanceState[student.studentId]
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-green-100 text-green-600 hover:bg-green-200"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        Mark{" "}
                        {attendanceState[student.studentId]
                          ? "Absent"
                          : "Present"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
            <span className="self-center text-sm text-gray-500">
              Present: {Object.values(attendanceState).filter(Boolean).length} /{" "}
              {students.length}
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting || isLocked}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              title={isLocked ? "Attendance locked for past dates" : ""}
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {isLocked ? "Locked" : "Submit Attendance"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
