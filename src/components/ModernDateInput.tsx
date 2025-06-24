import React, { forwardRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernDateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onClick?: () => void;
  isDarkMode?: boolean;
}

const ModernDateInput = forwardRef<HTMLInputElement, ModernDateInputProps>(
  ({ value, onClick, placeholder, isDarkMode, ...props }, ref) => (
    <div
      className={cn(
        'relative w-full',
        isDarkMode ? 'text-white' : 'text-black'
      )}
    >
      <input
        ref={ref}
        value={value}
        onClick={onClick}
        readOnly
        placeholder={placeholder}
        className={cn(
          'w-full pl-10 pr-3 py-2 rounded-lg border outline-none transition-all',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          isDarkMode
            ? 'bg-slate-800 border-gray-700 placeholder-gray-400 text-white'
            : 'bg-white border-gray-200 placeholder-gray-500 text-black',
          'shadow-sm'
        )}
        {...props}
      />
      <CalendarIcon
        className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none',
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        )}
      />
    </div>
  )
);
ModernDateInput.displayName = 'ModernDateInput';
export default ModernDateInput;
