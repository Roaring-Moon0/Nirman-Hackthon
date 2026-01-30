import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { Calendar } from 'lucide-react';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import TeacherSection from '../../components/TeacherSection';
import InfoCard from '../../components/InfoCard';
import FileDownloadButton from '../../components/FileDownloadButton';

const Notes = () => {
  const { token, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [token]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/student/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data.notes || []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) logout();
      const msg = err.response?.data?.message || err.message || 'Failed to load notes.';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileName) => {
    alert("Downloading " + fileName);
  };

  if (loading) return <Loader text="Loading study materials..." />;
  if (error) return <ErrorState message={error} onRetry={fetchNotes} />;
  if (notes.length === 0) return <EmptyState message="No notes have been shared yet." />;

  // Group by Teacher
  const groupedHelper = notes.reduce((acc, curr) => {
    const teacherName = curr.teacher || 'Unknown Teacher';
    if (!acc[teacherName]) {
      acc[teacherName] = [];
    }
    acc[teacherName].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Study Notes</h1>

      {Object.entries(groupedHelper).map(([teacher, items], index) => (
        <TeacherSection 
            key={index} 
            teacherName={teacher} 
            subject={items[0]?.subject || 'General'}
        >
          {items.map((item) => (
            <InfoCard 
                key={item.id} 
                title={item.title} 
                subtext={item.description}
            >
                <div className="space-y-3 mt-2">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Calendar size={12} />
                        <span>Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-50">
                       <FileDownloadButton fileName={item.fileName} onClick={() => handleDownload(item.fileName)} />
                    </div>
                </div>
            </InfoCard>
          ))}
        </TeacherSection>
      ))}
    </div>
  );
};

export default Notes;
