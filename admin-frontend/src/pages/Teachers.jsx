import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, BookOpen, Briefcase } from "lucide-react";
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
      const teacherData = response.data.filter((u) => u.role === "teacher");
      setTeachers(teacherData);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await axiosInstance.delete(`/admin/teacher/${id}`);
      setTeachers((prev) => prev.filter((t) => t._id !== id));
      alert("Teacher deleted successfully");
    } catch (error) {
      alert("Failed to delete teacher");
    }
  };

  const handleAddSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.ADD_TEACHER, data);
      setIsModalOpen(false);
      fetchTeachers();
      alert("Teacher added successfully!");
    } catch (error) {
      alert("Failed to add teacher");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
          <p className="text-slate-500">Manage faculty and assignments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} />
          Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search teachers..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Assigned Classes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading faculty...
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-12 text-center text-slate-500 bg-slate-50/50"
                  >
                    <p className="font-medium">No teachers added yet.</p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher._id || teacher.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                          {teacher.name?.charAt(0) || "T"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {teacher.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {teacher.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-slate-400" />
                        {teacher.department || "General"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {teacher.assignedClasses?.length > 0 ? (
                          teacher.assignedClasses.map((cls, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100"
                            >
                              {cls}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No classes assigned
                          </span>
                        )}
                      </div>
                      {teacher.subjects?.length > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <BookOpen size={12} />
                          {teacher.subjects.join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(teacher._id || teacher.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
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
