import React from 'react';

const InfoCard = ({ title, subtext, children, action }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start mb-3">
        <div>
           <h4 className="font-bold text-gray-800 text-lg line-clamp-1" title={title}>{title}</h4>
           {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="mt-2 text-sm text-gray-600">
        {children}
      </div>
    </div>
  );
};

export default InfoCard;
