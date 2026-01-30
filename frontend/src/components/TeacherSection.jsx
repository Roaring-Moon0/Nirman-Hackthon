import React from 'react';

const TeacherSection = ({ teacherName, subject, children }) => {
  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-2">
        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
          {teacherName?.charAt(0) || 'T'}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{teacherName}</h3>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{subject}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
};

export default TeacherSection;
