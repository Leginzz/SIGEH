import React from 'react';

interface ReusableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const ReusableInput = React.forwardRef<HTMLInputElement, ReusableInputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-300' : 'border-gray-300'} ${className || ''}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

ReusableInput.displayName = 'ReusableInput';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function ReusableSelect({ label, options, id, className, ...props }: SelectProps) {
  const selectId = id || props.name;
  return (
    <div className="space-y-1">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        id={selectId}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${className || ''}`}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
