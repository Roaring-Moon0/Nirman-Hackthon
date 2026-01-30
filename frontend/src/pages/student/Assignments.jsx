import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { Calendar, FileText } from 'lucide-react';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import TeacherSection from '../../components/TeacherSection';
import InfoCard from '../../components/InfoCard';
import StatusBadge from '../../components/StatusBadge';
import FileDownloadButton from '../../components/FileDownloadButton';
import FileUploadButton from '../../components/FileUploadButton';

const Assignments = () => {
  const { token, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, [token]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/student/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The API returns { assignments: [...] }
      setAssignments(res.data.assignments || []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) logout();
      const msg = err.response?.data?.message || err.message || 'Failed to load assignments.';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (assignmentId) => {
    // Placeholder for upload logic - real upload would need a separate API call + File object
    alert("Upload feature would open file picker here for Assignment ID: " + assignmentId);
  };

  const handleDownload = (fileName) => {
    // Placeholder - real download would trigger window.open or similar
    alert("Downloading " + fileName);
  };

  if (loading) return <Loader text="Loading assignments..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAssignments} />;
  if (assignments.length === 0) return <EmptyState message="No assignments available right now." />;

  // Group by Teacher
  const groupedHelper = assignments.reduce((acc, curr) => {
    const teacherName = curr.teacher || 'Unknown Teacher';
    if (!acc[teacherName]) {
      acc[teacherName] = [];
    }
    acc[teacherName].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
      
      {Object.entries(groupedHelper).map(([teacher, items], index) => (
        <TeacherSection 
            key={index} 
            teacherName={teacher} 
            subject={items[0]?.subject || 'General'} // Assuming one teacher usually teaches one subject to this student
        >
          {items.map((item) => (
            <InfoCard 
                key={item.id} 
                title={item.title} 
                subtext={`Due: ${new Date(item.dueDate).toLocaleDateString()}`}
                action={<StatusBadge status={item.status} />}
            >
                <div className="space-y-3 mt-2">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={14} />
                        <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                    </div>
                    {item.fileName && (
                       <FileDownloadButton fileName={item.fileName} onClick={() => handleDownload(item.fileName)} />
                    )}
                    
                    <div className="pt-2 border-t border-gray-50 flex justify-end">
                       {item.status === 'pending' || item.status === 'overdue' ? (
                          <FileUploadButton onUpload={() => handleUpload(item.id)} label="Submit Work" />
                       ) : (
                          <span className="text-sm font-medium text-green-600">Submitted</span>
                       )}
                    </div>
                </div>
            </InfoCard>
          ))}
        </TeacherSection>
      ))}
    </div>
  );
};

export default Assignments;
