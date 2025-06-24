import React, { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
  isDarkMode?: boolean;
}

const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, className = "", isDarkMode }) => {
  const [currentMonth, setCurrentMonth] = useState(selected ? startOfMonth(selected) : startOfMonth(new Date()));
  const today = new Date();

  React.useEffect(() => {
    if (selected) {
      setCurrentMonth(startOfMonth(selected));
    }
  }, [selected]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const rows = [];
    let days = [];
    const day = new Date(startDate.getTime()); // clone to avoid mutation
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayForButton = new Date(day.getFullYear(), day.getMonth(), day.getDate()); // always local, no mutation
        const isCurrentMonth = isSameMonth(dayForButton, monthStart);
        const isSelected = selected && isSameDay(dayForButton, selected);
        const isToday = isSameDay(dayForButton, today);
        let dayClass = "w-9 h-9 flex items-center justify-center rounded-lg font-normal text-sm transition-none group";
        if (isSelected) {
          // Selected: light color in dark mode, black in light mode
          dayClass = isDarkMode
            ? "w-9 h-9 flex items-center justify-center rounded-lg font-normal text-sm bg-white text-black border-none shadow-none outline-none ring-0"
            : "w-9 h-9 flex items-center justify-center rounded-lg font-normal text-sm bg-black text-white border-none shadow-none outline-none ring-0";
        } else if (isToday) {
          // Today: use the same color as hover for highlight in dark mode, gray in light mode
          dayClass += isDarkMode ? " bg-gray-700 !bg-gray-700 text-white test-today-dark" : " bg-gray-200 text-black";
        } else if (isCurrentMonth) {
          // Remove hover from className, add it as a sibling span for custom effect
          dayClass += isDarkMode ? " text-gray-100" : " text-gray-900 hover:bg-gray-100";
        } else {
          dayClass += isDarkMode ? " text-gray-500" : " text-gray-400";
        }
        days.push(
          <button
            key={dayForButton.toISOString()}
            className={dayClass + (isCurrentMonth && isDarkMode ? ' dark-hover' : '')}
            onClick={() => isCurrentMonth && onSelect && onSelect(new Date(dayForButton.getFullYear(), dayForButton.getMonth(), dayForButton.getDate()))}
            disabled={!isCurrentMonth}
            tabIndex={isCurrentMonth ? 0 : -1}
            aria-label={format(dayForButton, "yyyy-MM-dd")}
            type="button"
            style={isSelected ? (isDarkMode ? { backgroundColor: '#fff', color: '#111827', border: 'none', boxShadow: 'none', outline: 'none' } : { backgroundColor: 'black', color: 'white', border: 'none', boxShadow: 'none', outline: 'none' }) : isToday ? (isDarkMode ? { backgroundColor: 'rgba(17,24,39,0.8)', color: '#fff', border: 'none' } : { backgroundColor: '#e5e7eb', color: '#000', border: 'none' }) : { border: 'none' }}
          >
            {format(dayForButton, "d")}
          </button>
        );
        day.setDate(day.getDate() + 1); // increment day safely
      }
      rows.push(
        <div className="flex w-full justify-center" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  // Add a custom style for dark-hover effect
  // This must be added globally, but for now, inject a <style> tag for demo
  if (typeof window !== 'undefined' && !document.getElementById('calendar-dark-hover-style')) {
    const style = document.createElement('style');
    style.id = 'calendar-dark-hover-style';
    style.innerHTML = `
      .dark .dark-hover:hover:not(:disabled) {
        background-color: #374151 !important; /* Tailwind gray-700 */
      }
    `;
    document.head.appendChild(style);
  }

  return (
    <div
      className={`w-full max-w-xs mx-auto rounded-lg border p-4 ${className}`}
      style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#fff', boxShadow: document.documentElement.classList.contains('dark') ? '0 4px 24px 0 #0008' : '0 4px 24px 0 #0002', borderRadius: '0.5rem', borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb', color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827', zIndex: 1000, position: 'relative', background: document.documentElement.classList.contains('dark') ? '#111827 !important' : '#fff !important' }}
    >
      <div className="flex items-center justify-between mb-2 rounded-lg">
        <button
          className="p-1 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700"
          onClick={handlePrevMonth}
          aria-label="Previous Month"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-normal text-sm rounded-lg px-2 py-1">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          className="p-1 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700"
          onClick={handleNextMonth}
          aria-label="Next Month"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex w-full justify-center mb-1 rounded-lg bg-transparent">
        {dayNames.map((d) => (
          <div key={d} className="w-9 h-7 flex items-center justify-center text-xs font-normal opacity-70 rounded-lg">
            {d}
          </div>
        ))}
      </div>
      <div className="flex flex-col w-full gap-1 rounded-lg bg-transparent">{renderDays()}</div>
    </div>
  );
};

export { Calendar };
