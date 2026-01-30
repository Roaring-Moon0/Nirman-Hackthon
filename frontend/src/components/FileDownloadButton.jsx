import React from 'react';
import { Download } from 'lucide-react';

const FileDownloadButton = ({ fileName, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
      title="Download File"
    >
      <Download size={16} />
      <span className="truncate max-w-[150px]">{fileName || 'Download'}</span>
    </button>
  );
};

export default FileDownloadButton;
