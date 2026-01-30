import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/constants';
import { Users, Mail, BookOpen, User } from 'lucide-react';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

const Teachers = () => {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/student/my-teachers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeachers(res.data.teachers || []);
      } catch (err) {
        setError('Failed to load your teachers.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTeachers();
  }, [token]);

  if (loading) return <Loader text="Loading your teachers..." />;
  if (error) return <ErrorState message={error} />;
  if (teachers.length === 0) return <EmptyState message="No teachers assigned to your class yet." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Teachers</h1>
        <p className="text-gray-500">Faculty members assigned to your class</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div key={teacher.teacherId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <User size={24} />
                </div>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                  {teacher.subjectCode}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{teacher.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{teacher.department}</p>
              
              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <BookOpen size={16} className="text-gray-400" />
                  <span>{teacher.subject}</span>
                </div>
                {teacher.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    <a href={`mailto:${teacher.email}`} className="hover:text-purple-600 transition-colors">
                      {teacher.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teachers;
