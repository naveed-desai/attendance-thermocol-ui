import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Clock, ChevronDown, Check, X, Sparkles } from 'lucide-react';
import {
  formatTo12Hour,
  parseTimeTo12Hour,
  getCurrentTime12Hour,
} from '../../utils/time.ts';

interface TimePickerInputProps {
  value: string; // "hh:mm AM" / "hh:mm PM" or ""
  onChange: (time: string) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  badge?: React.ReactNode;
  helperText?: string;
  presets?: string[];
  allowClear?: boolean;
  defaultPeriod?: 'AM' | 'PM';
  defaultTimeOnOpen?: string;
  roundMode?: 'ceil' | 'floor' | 'nearest';
}

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  value,
  onChange,
  disabled = false,
  label = 'Select Time',
  placeholder = '--:-- --',
  badge,
  helperText,
  presets = ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'],
  allowClear = false,
  defaultPeriod = 'AM',
  defaultTimeOnOpen,
  roundMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverAlign, setPopoverAlign] = useState<'left' | 'right'>('left');
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive hour, minute, and period from current value, using defaultPeriod as fallback
  const { hour, minute, period } = useMemo(() => {
    return parseTimeTo12Hour(value, defaultPeriod);
  }, [value, defaultPeriod]);

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      // If opening and no time selected yet, auto-set defaultTimeOnOpen if provided
      if (!value && defaultTimeOnOpen) {
        onChange(defaultTimeOnOpen);
      }
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

  // 12-hour list: 01 to 12
  const hoursList = useMemo(() => {
    const list: string[] = [];
    for (let i = 1; i <= 12; i++) {
      list.push(String(i).padStart(2, '0'));
    }
    return list;
  }, []);

  // 5-minute intervals: 00, 05, ..., 55
  const minutesList = useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < 60; i += 5) {
      list.push(String(i).padStart(2, '0'));
    }
    return list;
  }, []);

  const handleSelectHour = (h: string) => {
    const newTime = `${h}:${minute} ${period}`;
    onChange(newTime);
  };

  const handleSelectMinute = (m: string) => {
    const newTime = `${hour}:${m} ${period}`;
    onChange(newTime);
  };

  const handleSelectPeriod = (newPeriod: 'AM' | 'PM') => {
    const newTime = `${hour}:${minute} ${newPeriod}`;
    onChange(newTime);
  };

  const handleSelectPreset = (preset: string) => {
    onChange(formatTo12Hour(preset));
    setIsOpen(false);
  };

  const handleSetCurrentTime = () => {
    const current = getCurrentTime12Hour(roundMode || 'nearest');
    onChange(current);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const displayValue = useMemo(() => {
    return formatTo12Hour(value);
  }, [value]);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
          {badge}
        </div>
      )}

      {/* Input Trigger Button */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleToggleOpen();
          }
        }}
        className={`w-full flex items-center justify-between pl-3 pr-3 py-2 bg-slate-50 border rounded-xl text-sm font-medium transition-all text-left select-none ${
          isOpen
            ? 'bg-white ring-2 ring-indigo-500 border-indigo-500 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center space-x-2.5 truncate">
          <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className={`font-mono text-sm ${displayValue ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
            {displayValue || placeholder}
          </span>
        </div>

        <div className="flex items-center space-x-1 shrink-0 ml-1">
          {allowClear && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
              title="Clear time"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? 'rotate-180 text-indigo-600' : ''
            }`}
          />
        </div>
      </div>

      {helperText && (
        <span className="text-[10px] text-slate-400 mt-1 block">
          {helperText}
        </span>
      )}

      {/* Dropdown Popover (Anchored directly beneath the input box) */}
      {isOpen && (
        <div
          className={`absolute top-full ${
            popoverAlign === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 z-50 w-full sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-xl p-3.5 animate-in fade-in zoom-in-95 duration-100`}
        >
          {/* Header Preview & Current Time */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <div className="flex items-center space-x-1.5 bg-indigo-50/80 border border-indigo-100 px-3 py-1 rounded-xl">
              <span className="text-xs text-indigo-500 font-medium">Time:</span>
              <span className="font-mono font-black text-indigo-700 text-sm">
                {displayValue || `${hour}:${minute} ${period}`}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSetCurrentTime}
              className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Current</span>
            </button>
          </div>

          {/* AM / PM Segmented Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-3">
            <button
              type="button"
              onClick={() => handleSelectPeriod('AM')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === 'AM'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AM (Morning)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPeriod('PM')}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === 'PM'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PM (Afternoon / Evening)
            </button>
          </div>

          {/* Quick Presets */}
          {presets && presets.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Shift Hours
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset) => {
                  const formattedPreset = formatTo12Hour(preset);
                  const isMatch = displayValue === formattedPreset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectPreset(formattedPreset)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        isMatch
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {formattedPreset}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dual Column Picker: Hours (1-12) & Minutes */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            {/* Hours Column */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Hour (1 – 12)
              </span>
              <div className="max-h-36 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                {hoursList.map((h) => {
                  const isSelected = hour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelectHour(h)}
                      className={`w-full text-center py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {h} {period}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes Column */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Minute
              </span>
              <div className="max-h-36 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                {minutesList.map((m) => {
                  const isSelected = minute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectMinute(m)}
                      className={`w-full text-center py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      :{m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Close / Done Button */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
