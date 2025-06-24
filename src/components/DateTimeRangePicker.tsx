import React, { useState } from 'react';
import { Calendar, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { buttonVariants } from '@/components/ui/button-variants';
import { TimeDropdown } from './TimeDropdown';
import { TimeSelector } from './ui/timeselector';

// Custom hook to detect dark mode by observing the <html> class list
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

interface DateTimeRangePickerProps {
  startDateTime: Date | null;
  endDateTime: Date | null;
  onStartDateTimeChange: (date: Date | null) => void;
  onEndDateTimeChange: (date: Date | null) => void;
  onClear: () => void;
  className?: string;
}

const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const ampm = ['AM', 'PM'];

function getTimeParts(date: Date | null) {
  if (!date) return { hour: '', minute: '', amPm: '' };
  let hour = date.getHours();
  const minute = date.getMinutes();
  const isPM = hour >= 12;
  hour = hour % 12 || 12;
  return {
    hour: hour.toString(),
    minute: minute.toString().padStart(2, '0'),
    amPm: isPM ? 'PM' : 'AM',
  };
}

function setTime(date: Date, hour: string, minute: string, amPmVal: string) {
  let h = parseInt(hour, 10);
  if (amPmVal === 'PM' && h < 12) h += 12;
  if (amPmVal === 'AM' && h === 12) h = 0;
  date.setHours(h, parseInt(minute, 10), 0, 0);
  return new Date(date);
}

const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  startDateTime,
  endDateTime,
  onStartDateTimeChange,
  onEndDateTimeChange,
  onClear,
  className,
}) => {
  const isDarkMode = useIsDarkMode();

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const newDateTime = startDateTime ? new Date(startDateTime) : new Date();
      newDateTime.setFullYear(date.getFullYear());
      newDateTime.setMonth(date.getMonth());
      newDateTime.setDate(date.getDate());
      onStartDateTimeChange(newDateTime);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const newDateTime = endDateTime ? new Date(endDateTime) : new Date();
      newDateTime.setFullYear(date.getFullYear());
      newDateTime.setMonth(date.getMonth());
      newDateTime.setDate(date.getDate());
      onEndDateTimeChange(newDateTime);
    }
  };

  const handleStartTimeChange = (time: string) => {
    if (time && startDateTime) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDateTime = new Date(startDateTime);
      newDateTime.setHours(hours, minutes, 0, 0);
      onStartDateTimeChange(newDateTime);
    }
  };

  const handleEndTimeChange = (time: string) => {
    if (time && endDateTime) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDateTime = new Date(endDateTime);
      newDateTime.setHours(hours, minutes, 0, 0);
      onEndDateTimeChange(newDateTime);
    }
  };

  const formatTime = (date: Date | null): string => {
    if (!date) return '';
    return date.toTimeString().slice(0, 5); // HH:MM format
  };

  const hasActiveFilter = startDateTime || endDateTime;

  const getFilterSummary = (): string => {
    if (!hasActiveFilter) return '';
    
    if (startDateTime && endDateTime) {
      return `${format(startDateTime, 'MMM dd, yyyy HH:mm')} to ${format(endDateTime, 'MMM dd, yyyy HH:mm')}`;
    } else if (startDateTime) {
      return `From ${format(startDateTime, 'MMM dd, yyyy HH:mm')}`;
    } else if (endDateTime) {
      return `Until ${format(endDateTime, 'MMM dd, yyyy HH:mm')}`;
    }
    return '';
  };

  // Dropdown state for time pickers
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [endTimeOpen, setEndTimeOpen] = useState(false);

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center mb-4">
          <h3 className="text-sm font-medium text-foreground text-center">
            DateTime Filter
          </h3>
          {hasActiveFilter && (
            <Button
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2 flex items-center gap-1 border border-input bg-background shadow-none text-black dark:text-white")}
              onClick={onClear}
              type="button"
            >
              <XCircle className="w-4 h-4" />
              Clear Filter
            </Button>
          )}
        </div>

        {hasActiveFilter && (
          <div className="mb-4 flex justify-center">
            <Badge
              variant="default"
              className={cn("text-xs text-center")}
            >
              Showing logs from: {getFilterSummary()}
            </Badge>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start DateTime */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">
              Start Date & Time
            </Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 min-w-0 justify-start text-left font-normal text-foreground border border-input bg-background shadow-none", !startDateTime && "text-muted-foreground")}
                  >
                    <Calendar className="w-3 h-3 mr-2 text-foreground" />
                    {startDateTime ? format(startDateTime, 'MMM dd, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={8}
                  className={cn(
                    "z-50 p-0 border-0 shadow-none rounded-none min-w-0 max-w-none bg-white dark:bg-gray-900"
                  )}
                  style={{ position: 'absolute', minWidth: 0 }}
                >
                  <CalendarComponent
                    selected={startDateTime || undefined}
                    onSelect={handleStartDateChange}
                    isDarkMode={isDarkMode}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-1 relative">
                <Clock className="w-3 h-3 text-foreground" />
                <Button
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-30 text-xs text-foreground flex justify-between items-center border border-input bg-background shadow-none")}
                  disabled={!startDateTime}
                  onClick={() => setStartTimeOpen((v) => !v)}
                  type="button"
                  tabIndex={0}
                >
                  {startDateTime
                    ? (() => {
                        const { hour, minute, amPm: ap } = getTimeParts(startDateTime);
                        return `${hour}:${minute} ${ap}`;
                      })()
                    : '--:-- --'}
                  <span className="ml-2">&#x25BC;</span>
                </Button>
                {startTimeOpen && startDateTime && (
  <TimeSelector
    hour={getTimeParts(startDateTime).hour}
    minute={getTimeParts(startDateTime).minute}
    amPm={getTimeParts(startDateTime).amPm}
    onHourChange={(val) => {
      const { minute, amPm } = getTimeParts(startDateTime);
      onStartDateTimeChange(setTime(new Date(startDateTime), val, minute, amPm));
    }}
    onMinuteChange={(val) => {
      const { hour, amPm } = getTimeParts(startDateTime);
      onStartDateTimeChange(setTime(new Date(startDateTime), hour, val, amPm));
    }}
    onAmPmChange={(val) => {
      const { hour, minute } = getTimeParts(startDateTime);
      onStartDateTimeChange(setTime(new Date(startDateTime), hour, minute, val));
    }}
    onConfirm={() => setStartTimeOpen(false)}
  />
)}
              </div>
            </div>
          </div>

          {/* End DateTime */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">
              End Date & Time
            </Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 min-w-0 justify-start text-left font-normal text-foreground border border-input bg-background shadow-none", !endDateTime && "text-muted-foreground")}
                  >
                    <Calendar className="w-3 h-3 mr-2 text-foreground" />
                    {endDateTime ? format(endDateTime, 'MMM dd, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={8}
                  className={cn(
                    "z-50 p-0 border-0 shadow-none rounded-none min-w-0 max-w-none bg-white dark:bg-gray-900"
                  )}
                  style={{ position: 'absolute', minWidth: 0 }}
                >
                  <CalendarComponent
                    selected={endDateTime || undefined}
                    onSelect={handleEndDateChange}
                    isDarkMode={isDarkMode}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-1 relative">
                <Clock className="w-3 h-3 text-foreground" />
                <Button
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-30 text-xs text-foreground flex justify-between items-center border border-input bg-background shadow-none")}
                  disabled={!endDateTime}
                  onClick={() => setEndTimeOpen((v) => !v)}
                  type="button"
                  tabIndex={0}
                >
                  {endDateTime
                    ? (() => {
                        const { hour, minute, amPm: ap } = getTimeParts(endDateTime);
                        return `${hour}:${minute} ${ap}`;
                      })()
                    : '--:-- --'}
                  <span className="ml-2">&#x25BC;</span>
                </Button>
                {endTimeOpen && endDateTime && (
  <TimeSelector
    hour={getTimeParts(endDateTime).hour}
    minute={getTimeParts(endDateTime).minute}
    amPm={getTimeParts(endDateTime).amPm}
    onHourChange={(val) => {
      const { minute, amPm } = getTimeParts(endDateTime);
      onEndDateTimeChange(setTime(new Date(endDateTime), val, minute, amPm));
    }}
    onMinuteChange={(val) => {
      const { hour, amPm } = getTimeParts(endDateTime);
      onEndDateTimeChange(setTime(new Date(endDateTime), hour, val, amPm));
    }}
    onAmPmChange={(val) => {
      const { hour, minute } = getTimeParts(endDateTime);
      onEndDateTimeChange(setTime(new Date(endDateTime), hour, minute, val));
    }}
    onConfirm={() => setEndTimeOpen(false)}
  />
)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateTimeRangePicker;
