import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  badge?: string;
  sublabel?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  label?: string;
  align?: 'left' | 'right';
  fullWidth?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  icon,
  disabled = false,
  className = '',
  menuClassName = '',
  label,
  align = 'left',
  fullWidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [menuAlign, setMenuAlign] = useState<'left' | 'right'>(align);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      if (align === 'right') {
        setMenuAlign('right');
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        if (rect.left + 240 > screenWidth) {
          setMenuAlign('right');
        } else {
          setMenuAlign('left');
        }

        const spaceBelow = screenHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 240 && spaceAbove > spaceBelow) {
          setOpenUpwards(true);
        } else {
          setOpenUpwards(false);
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

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? 'w-full' : 'inline-block'}`}
    >
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggleOpen}
        className={`flex items-center justify-between gap-2 px-3 py-2 bg-white border rounded-xl text-xs font-semibold transition-all text-left select-none ${
          fullWidth ? 'w-full' : 'min-w-[150px]'
        } ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
          <span className={`truncate ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu (Directly aligned above or below the trigger) */}
      {isOpen && (
        <div
          className={`absolute ${
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } z-50 min-w-full w-max max-w-[calc(100vw-2rem)] max-h-64 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100 scrollbar-thin ${
            menuAlign === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex flex-col truncate">
                  <span className="truncate">{opt.label}</span>
                  {opt.sublabel && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      {opt.sublabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {opt.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
