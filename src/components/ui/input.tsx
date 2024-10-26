import React from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:ring-blue-500 focus:border-blue-500 sm:text-sm
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-300' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function PasswordInput({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10
            ${error ? 'border-red-300' : ''}
            ${className}
          `}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function SearchInput({
  className = '',
  ...props
}: Omit<InputProps, 'icon'>) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="search"
        className={`
          block w-full pl-10 pr-3 py-2 rounded-md border-gray-300
          focus:ring-blue-500 focus:border-blue-500 sm:text-sm
          ${className}
        `}
        {...props}
      />
    </div>
  );
}