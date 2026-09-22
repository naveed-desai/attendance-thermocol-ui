import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/index.ts';
import { setRole, setActiveEmployeeId, logout } from '../store/slices/authSlice.ts';
import { Shield, User, Clock, LogOut, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser, currentRole, activeEmployeeId } = useAppSelector(
    (state) => state.auth,
  );
  const { list: employees } = useAppSelector((state) => state.employees);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-4 w-full">
          {/* Logo & System Title (Hidden on mobile as per user requirement) */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-slate-900 leading-tight">
                WorkTime & Salary
              </div>
              <div className="text-xs text-slate-500">
                Attendance & Payroll Engine
              </div>
            </div>
          </div>

          {/* User Controls & Navigation */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* If Admin: Allow switching views */}
            {isAdmin && (
              <div className="bg-slate-100 p-0.5 sm:p-1 rounded-xl flex items-center border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => dispatch(setRole('admin'))}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentRole === 'admin'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setRole('employee'));
                    if (!activeEmployeeId && employees.length > 0) {
                      dispatch(setActiveEmployeeId(employees[0]._id));
                    }
                  }}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentRole === 'employee'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    <span className="sm:hidden">Emp</span>
                    <span className="hidden sm:inline">Employee</span>
                  </span>
                </button>
              </div>
            )}

            {/* User Profile Menu with Logout Dropdown */}
            {currentUser && (
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center space-x-1 sm:space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 transition-all cursor-pointer select-none shrink-0"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  title="Account Menu"
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isAdmin
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-800 text-xs leading-none max-w-[55px] xs:max-w-[85px] sm:max-w-none truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-none hidden sm:block">
                      {isAdmin ? 'Administrator' : currentUser.phone}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      userMenuOpen ? 'rotate-180 text-slate-600' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 sm:w-56 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2.5 border-b border-slate-100">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {isAdmin ? 'Administrator' : currentUser.phone}
                      </div>
                      {currentUser.email && (
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {currentUser.email}
                        </div>
                      )}
                    </div>

                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          dispatch(logout());
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
