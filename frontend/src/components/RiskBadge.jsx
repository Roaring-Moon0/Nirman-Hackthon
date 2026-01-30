import React from 'react';

const RiskBadge = ({ level }) => {
  const getStyles = () => {
    if (!level) return 'bg-gray-50 text-gray-600 border-gray-100';
    
    switch (level.split(' ')[0]) { // Handle "High Risk" vs "High"
      case 'High':
      case 'Critical':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium':
      case 'Moderate':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Low':
        return 'bg-green-50 text-green-600 border-green-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStyles()}`}>
      {level || 'Unknown'}
    </span>
  );
};

export default RiskBadge;
