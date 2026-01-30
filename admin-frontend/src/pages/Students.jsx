import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, Eye, MoreVertical } from "lucide-react";
import axiosInstance from "../api/axios";
import Modal from "../components/Modal";
import AdminForm from "../components/AdminForm";
import { API_ENDPOINTS, FORM_FIELDS } from "../utils/constants";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/admin/users");
      // Filter only students from the mixed response
      const studentData = response.data.filter((u) => u.role === "student");
      setStudents(studentData);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this student? This action cannot be undone.",
      )
    )
      return;

    try {
      await axiosInstance.delete(`/admin/student/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      alert("Student deleted successfully");
    } catch (error) {
      alert(
        "Failed to delete student: " +
          (error.response?.data?.message || "Unknown error"),
      );
    }
  };

  const handleAddSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.ADD_STUDENT, data);
      setIsModalOpen(false);
      fetchStudents(); // Refresh list
      alert("Student added successfully!");
    } catch (error) {
      alert(
        "Failed to add student: " +
          (error.response?.data?.message || "Unknown error"),
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-slate-500">
            Manage student enrollment and records
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-12 text-center text-slate-500 bg-slate-50/50"
                  >
                    <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
                      <Search size={24} className="text-slate-400" />
                    </div>
                    <p className="font-medium">No students found</p>
                    <p className="text-sm mt-1">
                      Add a new student to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student._id || student.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {student.rollNo || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {student.name?.charAt(0) || "S"}
                        </div>
                        <div className="font-medium text-slate-800">
                          {student.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                        {student.className || student.classCode || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}
                      >
                        {student.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(student._id || student.id)
                          }
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Student"
      >
        <AdminForm
          fields={FORM_FIELDS.STUDENT}
          onSubmit={handleAddSubmit}
          submitText="Create Student"
          loading={submitLoading}
        />
      </Modal>
    </div>
  );
};

export default StudentsPage;
