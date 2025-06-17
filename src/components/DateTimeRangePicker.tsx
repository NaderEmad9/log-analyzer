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
  if (!date) return { hour: '', minute: '', ampm: '' };
  let hour = date.getHours();
  const minute = date.getMinutes();
  const isPM = hour >= 12;
  hour = hour % 12 || 12;
  return {
    hour: hour.toString(),
    minute: minute.toString().padStart(2, '0'),
    ampm: isPM ? 'PM' : 'AM',
  };
}

function setTime(date: Date, hour: string, minute: string, ampmVal: string) {
  let h = parseInt(hour, 10);
  if (ampmVal === 'PM' && h < 12) h += 12;
  if (ampmVal === 'AM' && h === 12) h = 0;
  date.setHours(h, parseInt(minute, 10), 0, 0);
  return new Date(date);
}

const DateTimeRangePicker: React.FC<DateTimeRangePickerProps> = ({
  startDateTime,
  endDateTime,
  onStartDateTimeChange,
  onEndDateTimeChange,
  onClear,
  className
}) => {
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
              variant="outline"
              size="sm"
              onClick={onClear}
              className="mt-2 flex items-center gap-1"
              type="button"
            >
              <XCircle className="w-4 h-4" />
              Clear Filter
            </Button>
          )}
        </div>

        {hasActiveFilter && (
          <div className="mb-4 flex justify-center">
            <Badge variant="secondary" className="text-xs text-foreground text-center">
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
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1 min-w-0 justify-start text-left font-normal text-foreground",
                      !startDateTime && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="w-3 h-3 mr-2 text-foreground" />
                    {startDateTime ? format(startDateTime, 'MMM dd, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDateTime || undefined}
                    onSelect={handleStartDateChange}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-1 relative">
                <Clock className="w-3 h-3 text-foreground" />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-30 text-xs text-foreground flex justify-between items-center"
                  disabled={!startDateTime}
                  onClick={() => setStartTimeOpen((v) => !v)}
                  type="button"
                  tabIndex={0}
                >
                  {startDateTime
                    ? (() => {
                        const { hour, minute, ampm: ap } = getTimeParts(startDateTime);
                        return `${hour}:${minute} ${ap}`;
                      })()
                    : '--:-- --'}
                  <span className="ml-2">&#x25BC;</span>
                </Button>
                {startTimeOpen && startDateTime && (
                  <div
                    className="absolute z-50 top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded flex gap-1 p-2 shadow-none"
                    style={{ minWidth: '7.5rem' }}
                  >
                    <select
                      className="appearance-none px-2 py-1 rounded bg-gray-100 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-400 text-xs"
                      value={getTimeParts(startDateTime).hour}
                      onChange={e => {
                        const { minute, ampm: ap } = getTimeParts(startDateTime);
                        onStartDateTimeChange(setTime(new Date(startDateTime), e.target.value, minute, ap));
                      }}
                    >
                      {hours12.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="px-1 text-foreground">:</span>
                    <select
                      className="appearance-none px-2 py-1 rounded bg-gray-100 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-400 text-xs"
                      value={getTimeParts(startDateTime).minute}
                      onChange={e => {
                        const { hour, ampm: ap } = getTimeParts(startDateTime);
                        onStartDateTimeChange(setTime(new Date(startDateTime), hour, e.target.value, ap));
                      }}
                    >
                      {minutes.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      className="appearance-none px-2 py-1 rounded bg-gray-100 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-400 text-xs"
                      value={getTimeParts(startDateTime).ampm}
                      onChange={e => {
                        const { hour, minute } = getTimeParts(startDateTime);
                        onStartDateTimeChange(setTime(new Date(startDateTime), hour, minute, e.target.value));
                      }}
                    >
                      {ampm.map(ap => (
                        <option key={ap} value={ap}>{ap}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-1 px-2 py-1 text-xs"
                      onClick={() => setStartTimeOpen(false)}
                      tabIndex={0}
                    >
                      OK
                    </Button>
                  </div>
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
                    variant="outline"
                    size="sm"
                    className={cn(
                      "flex-1 min-w-0 justify-start text-left font-normal text-foreground",
                      !endDateTime && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="w-3 h-3 mr-2 text-foreground" />
                    {endDateTime ? format(endDateTime, 'MMM dd, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDateTime || undefined}
                    onSelect={handleEndDateChange}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-1 relative">
                <Clock className="w-3 h-3 text-foreground" />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-30 text-xs text-foreground flex justify-between items-center"
                  disabled={!endDateTime}
                  onClick={() => setEndTimeOpen((v) => !v)}
                  type="button"
                  tabIndex={0}
                >
                  {endDateTime
                    ? (() => {
                        const { hour, minute, ampm: ap } = getTimeParts(endDateTime);
                        return `${hour}:${minute} ${ap}`;
                      })()
                    : '--:-- --'}
                  <span className="ml-2">&#x25BC;</span>
                </Button>
                {endTimeOpen && endDateTime && (
                  <div
                    className="absolute z-50 top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded flex gap-1 p-2 shadow-none"
                    style={{ minWidth: '7.5rem' }}
                  >
                    <select
                      className="appearance-none px-2 py-1 rounded bg-gray-100 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-400 text-xs"
                      value={getTimeParts(endDateTime).hour}
                      onChange={e => {
                        const { minute, ampm: ap } = getTimeParts(endDateTime);
                        onEndDateTimeChange(setTime(new Date(endDateTime), e.target.value, minute, ap));
                      }}
                    >
                      {hours12.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="px-1 text-foreground">:</span>
                    <select
                      className="appearance-none px-2 py-1 rounded bg-gray-100 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-400 text-xs"
                      value={getTimeParts(endDateTime).minute}
                      onChange={e => {
                        const { hour, ampm: ap } = getTimeParts(endDateTime);
                        onEndDateTimeChange(setTime(new Date(endDateTime), hour, e.target.value, ap));
                      }}
                    >
                      {minutes.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      className="appearance-none px-2 py-1 rounded bg-gray-100 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-400 text-xs"
                      value={getTimeParts(endDateTime).ampm}
                      onChange={e => {
                        const { hour, minute } = getTimeParts(endDateTime);
                        onEndDateTimeChange(setTime(new Date(endDateTime), hour, minute, e.target.value));
                      }}
                    >
                      {ampm.map(ap => (
                        <option key={ap} value={ap}>{ap}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-1 px-2 py-1 text-xs"
                      onClick={() => setEndTimeOpen(false)}
                      tabIndex={0}
                    >
                      OK
                    </Button>
                  </div>
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
