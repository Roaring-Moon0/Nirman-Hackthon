import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, Filter } from "lucide-react";
import axiosInstance from "../api/axios";
import Modal from "../components/Modal";
import AdminForm from "../components/AdminForm";
import { API_ENDPOINTS, FORM_FIELDS } from "../utils/constants";

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axiosInstance.get("/admin/users");
      // Filter only teachers from the mixed response
      const teacherData = response.data.filter((u) => u.role === "Teacher");
      setTeachers(teacherData);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this teacher? This action cannot be undone.",
      )
    )
      return;

    try {
      await axiosInstance.delete(`/admin/teacher/${id}`);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      alert(
        "Failed to delete teacher: " +
          (error.response?.data?.message || "Unknown error"),
      );
    }
  };

  const handleAddSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.ADD_TEACHER, data);
      setIsModalOpen(false);
      fetchTeachers(); // Refresh list
      alert("Teacher added successfully!");
    } catch (error) {
      alert(
        "Failed to add teacher: " +
          (error.response?.data?.message || "Unknown error"),
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.info.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
          <p className="text-slate-500">Manage faculty members</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or department..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500/20 text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    Loading teachers...
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{teacher.info}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          teacher.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Teacher"
                      >
                        <Trash2 size={18} />
                      </button>
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
        title="Add New Teacher"
      >
        <AdminForm
          fields={FORM_FIELDS.TEACHER}
          onSubmit={handleAddSubmit}
          submitText="Create Teacher"
          loading={submitLoading}
        />
      </Modal>
    </div>
  );
};

export default TeachersPage;
