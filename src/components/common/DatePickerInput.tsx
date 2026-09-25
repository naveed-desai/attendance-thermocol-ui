import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { getLocalDateString } from '../../utils/time.ts';

interface DatePickerInputProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  helperText?: string;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  disabled = false,
  label = 'Work Date',
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverAlign, setPopoverAlign] = useState<'left' | 'right'>('left');
  const containerRef = useRef<HTMLDivElement>(null);

  const [userNav, setUserNav] = useState<{ year: number; month: number } | null>(null);

  const baseYear = useMemo(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts[0]) return parts[0];
    }
    return new Date().getFullYear();
  }, [value]);

  const baseMonth = useMemo(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts[1]) return parts[1] - 1;
    }
    return new Date().getMonth();
  }, [value]);

  const viewYear = userNav ? userNav.year : baseYear;
  const viewMonth = userNav ? userNav.month : baseMonth;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        if (rect.left + 320 > screenWidth) {
          setPopoverAlign('right');
        } else {
          setPopoverAlign('left');
        }
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setUserNav({ year: viewYear - 1, month: 11 });
    } else {
      setUserNav({ year: viewYear, month: viewMonth - 1 });
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setUserNav({ year: viewYear + 1, month: 0 });
    } else {
      setUserNav({ year: viewYear, month: viewMonth + 1 });
    }
  };

  const selectDate = (year: number, month: number, day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setUserNav(null);
    onChange(formatted);
    setIsOpen(false);
  };

  const setToday = () => {
    const now = new Date();
    selectDate(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const setYesterday = () => {
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    selectDate(yest.getFullYear(), yest.getMonth(), yest.getDate());
  };

  // Build calendar matrix
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Monday as 0, Sunday as 6
    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

    const days: Array<{ day: number; isCurrentMonth: boolean; dateStr: string; isSunday: boolean } | null> = [];

    // Empty cells before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(viewYear, viewMonth, d).getDay();
      days.push({
        day: d,
        isCurrentMonth: true,
        dateStr,
        isSunday: dayOfWeek === 0,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  // Formatted display value
  const displayLabel = useMemo(() => {
    if (!value) return 'Select Date';
    try {
      const [y, m, d] = value.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return value;
    }
  }, [value]);

  const todayStr = useMemo(() => getLocalDateString(), []);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggleOpen}
        className={`w-full flex items-center justify-between pl-3 pr-3 py-2 bg-slate-50 border rounded-xl text-sm font-medium transition-all text-left ${
          isOpen
            ? 'bg-white ring-2 ring-indigo-500 border-indigo-500 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center space-x-2.5 truncate">
          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className={`truncate ${value ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-1 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {helperText && (
        <span className="text-[11px] text-slate-500 mt-1 block">
          {helperText}
        </span>
      )}

      {/* Dropdown Popover (Aligned directly beneath the input box) */}
      {isOpen && (
        <div
          className={`absolute top-full ${
            popoverAlign === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 z-50 w-full sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Quick presets */}
          <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-slate-100 text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Quick:</span>
            <button
              type="button"
              onClick={setToday}
              className="px-2.5 py-1 rounded-lg font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={setYesterday}
              className="px-2.5 py-1 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Yesterday
            </button>
          </div>

          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="font-bold text-slate-900 text-sm">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((wd, i) => (
              <span
                key={wd}
                className={`text-[11px] font-bold py-1 ${
                  i === 6 ? 'text-amber-600' : 'text-slate-400'
                }`}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="h-8" />;
              }

              const isSelected = item.dateStr === value;
              const isToday = item.dateStr === todayStr;

              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => selectDate(viewYear, viewMonth, item.day)}
                  className={`h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : isToday
                      ? 'bg-indigo-50 text-indigo-700 font-bold ring-1 ring-indigo-300'
                      : item.isSunday
                      ? 'text-amber-700 bg-amber-50/50 hover:bg-amber-100 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Legend / Status */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
              <span>Today / Selected</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center space-x-0.5"
            >
              <Check className="w-3 h-3 inline" />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
