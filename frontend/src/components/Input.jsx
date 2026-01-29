import React from 'react'

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  icon,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-lg border-2 
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-purple-500'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            outline-none transition-all duration-200
            placeholder:text-gray-400
            text-gray-800 font-medium
          `}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  )
}

export default Input
