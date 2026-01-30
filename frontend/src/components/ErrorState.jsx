import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-6">{message || 'An unexpected error occurred. Please try again.'}</p>
        
        {onRetry && (
          <button 
            onClick={onRetry}
            className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition active:scale-95"
          >
            <RefreshCcw size={18} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
