import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ message = 'No data available', subtext, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        <PackageOpen size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{message}</h3>
      {subtext && <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">{subtext}</p>}
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
