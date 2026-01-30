import React, { useState, useEffect } from "react";
import { Search, Calendar, FileText } from "lucide-react";
import axiosInstance from "../api/axios";

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axiosInstance.get("/admin/assignments");
      setAssignments(response.data);
    } catch (error) {
      console.warn("Failed to fetch assignments:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isClosed = !assignment.isActive;

    if (isClosed) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Closed
        </span>
      );
    }
    if (now > dueDate) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Overdue
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Active
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assignments</h1>
          <p className="text-slate-500">
            Monitor academic tasks and submissions
          </p>
        </div>
        <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
          View All
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
              placeholder="Search assignments..."
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
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Class & Subject</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Submissions</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Loading assignments...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-12 text-center text-slate-500 bg-slate-50/50"
                  >
                    <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
                      <FileText size={24} className="text-slate-400" />
                    </div>
                    <p className="font-medium">No assignments available</p>
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr
                    key={assignment._id || assignment.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {assignment.title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {assignment.subject?.subjectName ||
                          assignment.subjectName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {assignment.classCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <span className="font-medium text-slate-900">
                          {assignment.submissionsCount || 0}
                        </span>
                        <span className="text-slate-400">
                          / {assignment.totalStudents || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(assignment)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;
