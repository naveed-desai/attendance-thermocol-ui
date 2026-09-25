import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Check,
} from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className = '',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleToggleDropdown = () => {
    if (!isDropdownOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Default to opening upwards (dropup) for bottom-anchored pagination tables,
      // unless there is significantly more space below and space above is tight.
      if (spaceBelow >= 200 && spaceAbove < 160) {
        setOpenUpwards(false);
      } else {
        setOpenUpwards(true);
      }
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) {
        pages.push('ellipsis-start');
      }

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (safeCurrentPage < totalPages - 2) {
        pages.push('ellipsis-end');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`border-t border-slate-200 bg-slate-50/70 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none ${className}`}
    >
      {/* Left: Range and Page Size selector */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto text-center sm:text-left">
        <span className="text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{startItem}</span> -{' '}
          <span className="font-bold text-slate-800">{endItem}</span> of{' '}
          <span className="font-bold text-slate-800">{totalItems}</span> records
        </span>

        {onPageSizeChange && (
          <div className="flex items-center space-x-1.5 text-slate-600">
            <span className="hidden sm:inline text-slate-400 font-normal">|</span>
            <span className="text-slate-500 font-medium">Show:</span>

            {/* Custom Dropdown / Dropup that stays on-screen in mobile view */}
            <div ref={dropdownRef} className="relative inline-block text-left">
              <button
                type="button"
                onClick={handleToggleDropdown}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                className={`flex items-center justify-between gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 cursor-pointer shadow-2xs transition-all ${
                  isDropdownOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''
                }`}
              >
                <span>{pageSize}</span>
                <ChevronUp
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    (openUpwards && isDropdownOpen) || (!openUpwards && !isDropdownOpen)
                      ? ''
                      : 'rotate-180'
                  }`}
                />
              </button>

              {/* Dropdown Menu - Drops upwards (dropup) above the footer, horizontally centered on mobile so it never goes off-screen */}
              {isDropdownOpen && (
                <div
                  className={`absolute ${
                    openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                  } left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 z-50 min-w-[90px] bg-white rounded-xl border border-slate-200 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100`}
                >
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-0.5">
                    Per page
                  </div>
                  <div className="max-h-48 overflow-y-auto scrollbar-thin py-0.5">
                    {pageSizeOptions.map((opt) => {
                      const isSelected = opt === pageSize;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            onPageSizeChange(opt);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2.5 px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <span className="text-slate-500">/ page</span>
          </div>
        )}
      </div>

      {/* Right: Navigation Buttons */}
      <div className="flex items-center space-x-1 max-w-full overflow-x-auto py-0.5 px-1 scrollbar-none justify-center">
        {/* First Page */}
        <button
          type="button"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(1)}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer shrink-0"
          title="First page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer shrink-0"
          title="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1 px-1 shrink-0">
          {getPageNumbers().map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 py-1 text-slate-400 font-bold shrink-0"
                >
                  …
                </span>
              );
            }

            const isActive = p === safeCurrentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[28px] h-7 px-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          disabled={safeCurrentPage >= totalPages}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer shrink-0"
          title="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          disabled={safeCurrentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors cursor-pointer shrink-0"
          title="Last page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
