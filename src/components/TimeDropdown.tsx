import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function useIsDarkMode() {
  const [isDark, setIsDark] = React.useState(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

interface TimeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  highlightStyle?: 'active';
}

export const TimeDropdown: React.FC<TimeDropdownProps> = ({ value, onChange, options, highlightStyle }) => {
  const [open, setOpen] = useState(false);
  const isDarkMode = useIsDarkMode();

  // Strong highlight classes
  const highlightClass = isDarkMode
    ? 'bg-blue-400 text-black font-bold ring-2 ring-blue-300'
    : 'bg-blue-600 text-white font-bold ring-2 ring-blue-400';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'min-w-[3rem] h-10 rounded-md text-base font-medium justify-center px-3 shadow-sm transition-colors',
            highlightStyle === 'active' ? highlightClass : isDarkMode ? 'bg-[#1f2937] text-white' : 'bg-white text-black'
          )}
        >
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className={cn(
          'mt-1 rounded-md border shadow-md max-h-60 overflow-auto z-50 p-0 min-w-[3.2rem] w-[3.2rem]',
          isDarkMode ? 'bg-[#1f2937] text-white border-gray-700' : 'bg-white text-black border-gray-300'
        )}
        style={{ padding: 0, display: 'block' }}
      >
        <div>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={cn(
                'block mx-auto px-0 py-0 text-[11px] rounded hover:bg-gray-200 dark:hover:bg-gray-700 font-normal text-center',
                value === option && (isDarkMode ? 'bg-gray-700' : 'bg-gray-200')
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
