import React from 'react';
import { Upload } from 'lucide-react';

const FileUploadButton = ({ onUpload, label = "Upload", disabled = false }) => {
  return (
    <label className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all cursor-pointer shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <Upload size={16} className="text-blue-600" />
      <span className="text-sm font-medium">{label}</span>
      <input 
        type="file" 
        className="hidden" 
        onChange={onUpload} 
        disabled={disabled}
      />
    </label>
  );
};

export default FileUploadButton;
