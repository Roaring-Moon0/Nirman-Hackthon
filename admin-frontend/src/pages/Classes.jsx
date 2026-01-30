import React, { useState, useEffect } from "react";
import { Plus, Trash2, Users, BookOpen, UserPlus } from "lucide-react";
import axiosInstance from "../api/axios";
import Modal from "../components/Modal";
import AdminForm from "../components/AdminForm";
import { API_ENDPOINTS, FORM_FIELDS } from "../utils/constants";

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_CLASSES);
      setClasses(response.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classId) => {
    if (!confirm("Delete this class? This will unlink all students.")) return;
    try {
      await axiosInstance.delete(`/admin/class/${classId}`);
      setClasses((prev) => prev.filter((c) => c._id !== classId));
      alert("Class deleted successfully");
    } catch (error) {
      alert("Failed to delete class");
    }
  };

  const handleAddSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.CREATE_CLASS, data);
      setIsModalOpen(false);
      fetchClasses();
      alert("Class created successfully!");
    } catch (error) {
      alert("Failed to create class");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Classes</h1>
          <p className="text-slate-500">Manage academic batches and sections</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} />
          Create Class
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading classes...
        </div>
      ) : classes.length === 0 ? (
        /* Empty State */
        <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">
            No classes created
          </h3>
          <p className="text-slate-500 mt-1">
            Get started by creating a new class.
          </p>
        </div>
      ) : (
        /* Card Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 truncate">
                    {cls.classCode}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {cls.department}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 ml-2">
                  {cls.section}
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Users size={16} className="text-slate-400 flex-shrink-0" />
                  <span>{cls.studentCount || 0} Students</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <UserPlus
                    size={16}
                    className="text-slate-400 flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    {cls.teachers && cls.teachers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {cls.teachers.map((t, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 bg-slate-100 rounded text-xs truncate max-w-full"
                          >
                            {t.name || "Teacher"}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        No teachers assigned
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Year {cls.year} • {cls.course || "General"}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  Manage
                </button>
                <button
                  onClick={() => handleDelete(cls._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Class"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Class"
      >
        <AdminForm
          fields={FORM_FIELDS.CLASS}
          onSubmit={handleAddSubmit}
          submitText="Create Class"
          loading={submitLoading}
        />
      </Modal>
    </div>
  );
};

export default ClassesPage;
