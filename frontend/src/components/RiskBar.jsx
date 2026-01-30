import React from 'react';

const RiskBar = ({ level, score }) => {
  // Score is 0-100
  // Level: Low, Medium, High, Critical
  
  const getGradient = () => {
    if (!level) return 'from-gray-300 to-gray-400';
    if (level === 'High' || level.includes('Critical')) return 'from-red-500 to-orange-500';
    if (level === 'Medium' || level.includes('Moderate')) return 'from-orange-400 to-yellow-400';
    return 'from-green-400 to-emerald-500';
  };

  const width = Math.min(Math.max(score, 5), 100); // Min 5% width for visibility

  return (
    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full bg-gradient-to-r ${getGradient()} shadow-sm`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

export default RiskBar;
