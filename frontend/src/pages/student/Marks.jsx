import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import StatusBadge from '../../components/StatusBadge';

const Marks = () => {
  const { token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMarks();
  }, [token]);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/student/academic-overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) logout();
      const msg = err.response?.data?.message || err.message || 'Failed to load marks.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading academic performance..." />;
  if (error) return <ErrorState message={error} onRetry={fetchMarks} />;
  
  const bySubject = data?.bySubject || {};
  if (Object.keys(bySubject).length === 0) return <EmptyState message="No marks have been uploaded yet." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Academic Performance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(bySubject).map(([subject, exams]) => {
           // Calculate stats
           const totalExams = exams.length;
           const avg = totalExams > 0 
             ? (exams.reduce((sum, e) => sum + e.percentage, 0) / totalExams).toFixed(1)
             : 0;
           
           // Determine trend (Compare last two exams if available)
           // Sort by date ascending to find trend
           const sortedExams = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));
           let trend = 'stable';
           if (sortedExams.length >= 2) {
             const last = sortedExams[sortedExams.length - 1].percentage;
             const prev = sortedExams[sortedExams.length - 2].percentage;
             if (last > prev) trend = 'improving';
             else if (last < prev) trend = 'declining';
           }

           return (
             <div key={subject} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="text-xl font-bold text-gray-900">{subject}</h3>
                      <p className="text-sm text-gray-500">Teacher info unavailable</p> {/* Teacher isn't in marks API response usually */}
                   </div>
                   <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${trend === 'improving' ? 'bg-green-100 text-green-700' : trend === 'declining' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                      {trend === 'improving' ? <TrendingUp size={16} /> : trend === 'declining' ? <TrendingDown size={16} /> : <Minus size={16} />}
                      <span className="capitalize">{trend}</span>
                   </div>
                </div>

                <div className="mb-6">
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-gray-500 font-medium">Average Score</span>
                      <span className="text-3xl font-bold text-gray-900">{avg}%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${avg}%` }}></div>
                   </div>
                </div>

                <div className="flex-1">
                   <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Recent Exams</h4>
                   <div className="space-y-3">
                      {sortedExams.reverse().slice(0, 3).map((exam, idx) => (
                         <div key={idx} className="flex justify-between items-center text-sm">
                            <div>
                               <p className="font-medium text-gray-900">{exam.examName || 'Exam'}</p>
                               <p className="text-xs text-gray-400">{new Date(exam.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                               <p className="font-bold text-gray-900">{exam.obtainedMarks} / {exam.totalMarks}</p>
                               <span className={`text-xs ${exam.percentage >= 75 ? 'text-green-600' : exam.percentage >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                                  {exam.percentage}%
                               </span>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default Marks;
