
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
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

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">
            DateTime Filter
          </h3>
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-xs text-foreground hover:text-foreground"
            >
              Clear Filter
            </Button>
          )}
        </div>

        {hasActiveFilter && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-xs text-foreground">
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
                      "flex-1 justify-start text-left font-normal text-foreground",
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
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-foreground" />
                <Input
                  type="time"
                  value={formatTime(startDateTime)}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-20 text-xs text-foreground"
                  disabled={!startDateTime}
                />
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
                      "flex-1 justify-start text-left font-normal text-foreground",
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
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-foreground" />
                <Input
                  type="time"
                  value={formatTime(endDateTime)}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="w-20 text-xs text-foreground"
                  disabled={!endDateTime}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateTimeRangePicker;
