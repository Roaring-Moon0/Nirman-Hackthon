import React from 'react';

const StatCard = ({ icon: Icon, label, value, subtext, trend, colorString }) => {
  // Parsing color string logic if needed, or passing classes directly
  // Design: White card, icon logic, clean text
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorString || 'bg-blue-50 text-blue-600'}`}>
          <Icon size={22} />
        </div>
      </div>
      
      {(subtext || trend) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              trend === 'up' ? 'bg-green-100 text-green-700' : 
              trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'}
            </span>
          )}
          <p className="text-xs text-gray-400 font-medium">{subtext}</p>
        </div>
      )}
    </div>
  );
};

export default StatCard;
