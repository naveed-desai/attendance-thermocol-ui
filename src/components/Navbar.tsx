import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/index.ts';
import { setRole, setActiveEmployeeId, logout } from '../store/slices/authSlice.ts';
import { Shield, User, Clock, LogOut } from 'lucide-react';
import { CustomSelect } from './common/CustomSelect.tsx';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser, currentRole, activeEmployeeId } = useAppSelector(
    (state) => state.auth,
  );
  const { list: employees } = useAppSelector((state) => state.employees);

  const isAdmin = currentUser?.role === 'admin';

  const employeePreviewOptions = useMemo(() => {
    return [
      { value: '', label: '-- Select Employee --' },
      ...employees.map((emp) => ({
        value: emp._id,
        label: emp.name,
        badge: emp.phone,
      })),
    ];
  }, [employees]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Title (Hidden on mobile as per user requirement) */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Clock className="w-5 h-5" />
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* If Admin: Allow switching views and choosing an employee to preview */}
            {isAdmin && (
              <>
                {currentRole === 'employee' && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-medium text-slate-500 hidden md:inline">
                      Preview:
                    </span>
                    <CustomSelect
                      value={activeEmployeeId || ''}
                      onChange={(val) =>
                        dispatch(setActiveEmployeeId(val || null))
                      }
                      options={employeePreviewOptions}
                      placeholder="Select Employee"
                      className="py-1 px-2.5 bg-slate-50 text-xs max-w-[180px]"
                    />
                  </div>
                )}

                {/* Admin View Switcher Pill */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                  <button
                    type="button"
                    onClick={() => dispatch(setRole('admin'))}
                    className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentRole === 'admin'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
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
                    className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentRole === 'employee'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Employee</span>
                  </button>
                </div>
              </>
            )}

            {/* User Profile Chip */}
            {currentUser && (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-800 text-xs leading-none">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-none hidden sm:block">
                    {isAdmin ? 'Administrator' : currentUser.phone}
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
