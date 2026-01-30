import React from 'react';

const Loader = ({ fullScreen = false, text = 'Loading...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      <p className="text-gray-500 font-medium animate-pulse">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="p-4 flex justify-center">{content}</div>;
};

export default Loader;
