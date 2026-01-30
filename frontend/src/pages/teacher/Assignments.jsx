import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../utils/constants";
import {
  FileText,
  Upload,
  Plus,
  Calendar,
  Download,
  Trash2,
  Loader2,
  X,
  Users,
} from "lucide-react";

const TeacherAssignments = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    subjectId: "", // Will need to filter based on class
    dueDate: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [students, setStudents] = useState([]); // New state for student list
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, [token]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      console.log(
        "🔍 Fetching classes from:",
        `${API_BASE_URL}/api/teacher/classes`,
      );
      console.log("🔑 Token:", token ? "EXISTS" : "MISSING");

      const [classesRes, assignmentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/teacher/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/teacher/assignments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log("📊 Classes Response:", classesRes.data);
      console.log(
        "📚 Number of classes:",
        classesRes.data.classes?.length || 0,
      );

      // Extract simplified class list from dashboard data
      // Structure: res.data.classes[i].class (Object) and .subject (Object)
      setClasses(classesRes.data.classes || []);
      setAssignments(assignmentsRes.data.assignments || []);

      console.log(
        "✅ State updated with classes:",
        classesRes.data.classes?.length || 0,
      );
    } catch (err) {
      console.error("❌ Failed to fetch assignment data", err);
      console.error("Error details:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setFormData({ ...formData, classId });
    setStudents([]); // Clear previous students

    if (!classId) return;

    try {
      setLoadingStudents(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/teacher/classes/${classId}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Failed to fetch students for class", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("classId", formData.classId);

    // Find subject from classes array
    const selectedClassObj = classes.find(
      (c) => c.class._id === formData.classId,
    );
    const subjectId = selectedClassObj ? selectedClassObj.subject._id : "";
    data.append("subjectId", subjectId);

    data.append("dueDate", formData.dueDate);
    if (formData.file) data.append("file", formData.file);

    try {
      await axios.post(`${API_BASE_URL}/api/teacher/assignment/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage({ type: "success", text: "Assignment created successfully!" });
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        classId: "",
        subjectId: "",
        dueDate: "",
        file: null,
      });
      fetchInitialData(); // Refresh list
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload assignment",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading assignments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Create New
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {message.text}
        </div>
      )}

      {/* Create Form Modal/Panel */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Assignment</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.classId}
                    onChange={handleClassChange}
                  >
                    <option value="">Select Class</option>
                    {(() => {
                      console.log(
                        "🎨 Rendering dropdown, classes.length:",
                        classes.length,
                      );
                      console.log("🎨 Classes array:", classes);

                      if (classes.length === 0) {
                        return (
                          <option disabled>No classes assigned to you</option>
                        );
                      }

                      return classes.map((c, i) => {
                        console.log(
                          `🎨 Rendering option ${i}:`,
                          c.class?.classCode,
                          "-",
                          c.subject?.name,
                        );
                        return (
                          <option key={i} value={c.class._id}>
                            {c.class.classCode} - {c.subject.name}
                          </option>
                        );
                      });
                    })()}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachment (PDF)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                      <div className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm truncate">
                        {formData.file ? formData.file.name : "Choose File..."}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex justify-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Upload size={20} />
                  )}
                  Upload Assignment
                </button>
              </form>

              {/* Students Preview Panel */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-gray-500">
                  <Users size={20} />
                  <h3 className="font-semibold">Class Students</h3>
                </div>
                {loadingStudents ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    <Loader2 className="animate-spin mr-2" size={16} /> Loading
                    students...
                  </div>
                ) : students.length > 0 ? (
                  <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px]">
                    {students.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {s.name}
                            </p>
                            <p className="text-xs text-gray-400">{s.rollNo}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm text-center px-4">
                    {formData.classId
                      ? "No students found in this class."
                      : "Select a class to view student list."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="grid gap-4">
        {assignments.length > 0 ? (
          assignments.map((a) => (
            <div
              key={a._id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{a.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">
                      {a.classId.classCode}
                    </span>
                    <span>•</span>
                    <span
                      className={`flex items-center gap-1 ${new Date(a.dueDate) < new Date() ? "text-red-500" : "text-green-600"}`}
                    >
                      <Calendar size={14} />
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {/* Optional: Add View Submissions button here later */}
                {a.filePath && (
                  <a
                    href={`${API_BASE_URL}/api/download?path=${encodeURIComponent(a.filePath)}`} // Check download route safely
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download Attachment"
                  >
                    <Download size={20} />
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-gray-500 font-medium">No active assignments</h3>
            <p className="text-sm text-gray-400">Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignments;
