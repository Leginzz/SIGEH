import React from 'react';

interface ReusableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md';
  loading?: boolean;
}

const VARIANTS: Record<string, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  ghost: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
};

export function ReusableButton({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ReusableButtonProps) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  return (
    <button
      className={`font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClass} ${VARIANTS[variant]} ${className || ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
