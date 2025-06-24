import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Props {
  hour: string;
  minute: string;
  amPm: string;
  onHourChange: (val: string) => void;
  onMinuteChange: (val: string) => void;
  onAmPmChange: (val: string) => void;
  onConfirm: () => void;
}

const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const amPmOptions = ['AM', 'PM'];

export const TimeSelector: React.FC<Props> = ({
  hour,
  minute,
  amPm,
  onHourChange,
  onMinuteChange,
  onAmPmChange,
  onConfirm
}) => {
  const [isDarkMode, setIsDarkMode] = React.useState(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "absolute z-50 top-full left-0 mt-1 flex gap-1 p-2 rounded-md min-w-[11rem] items-center border border-gray-200 dark:border-gray-700",
        isDarkMode ? 'bg-[#1f2937]' : 'bg-white'
      )}
      style={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', opacity: 1 }}
    >
      <Select value={hour} onValueChange={onHourChange}>
        <SelectTrigger className="w-14 h-10 text-base font-medium rounded-md px-2 focus:ring-2 focus:ring-blue-500">
          {hour || "--"}
        </SelectTrigger>
        <SelectContent>
          {hours12.map((h) => (
            <SelectItem key={h} value={h} className="text-base">
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-base font-medium text-black dark:text-white">:</span>
      <Select value={minute} onValueChange={onMinuteChange}>
        <SelectTrigger className="w-14 h-10 text-base font-medium rounded-md px-2 focus:ring-2 focus:ring-blue-500">
          {minute || "--"}
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m} className="text-base">
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={amPm} onValueChange={onAmPmChange}>
        <SelectTrigger className="w-14 h-10 text-base font-medium rounded-md px-2 focus:ring-2 focus:ring-blue-500">
          {amPm || "--"}
        </SelectTrigger>
        <SelectContent>
          {amPmOptions.map((a) => (
            <SelectItem key={a} value={a} className="text-base">
              {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        className="text-xs font-semibold text-black dark:text-white px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 min-w-0"
        onClick={onConfirm}
        style={{ minWidth: '2.5rem', height: '2rem' }}
      >
        OK
      </Button>
    </div>
  );
};
