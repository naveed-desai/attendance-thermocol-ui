import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { fetchEmployees } from '../../store/slices/employeesSlice.ts';
import { fetchAttendance } from '../../store/slices/attendanceSlice.ts';
import { AdminEmployees } from './AdminEmployees.tsx';
import { AdminApprovals } from './AdminApprovals.tsx';
import { AdminRates } from './AdminRates.tsx';
import { AdminPayroll } from './AdminPayroll.tsx';
import {
  Users,
  CheckCircle2,
  Clock,
  IndianRupee,
  Sliders,
  Wallet,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list: employees } = useAppSelector((state) => state.employees);
  const { records } = useAppSelector((state) => state.attendance);

  const [activeTab, setActiveTab] = useState<'approvals' | 'employees' | 'payroll' | 'rates'>(
    'approvals',
  );
  const [targetPayrollEmployeeId, setTargetPayrollEmployeeId] = useState<string | undefined>();

  useEffect(() => {
    dispatch(fetchEmployees(false));
    dispatch(fetchAttendance({ status: 'pending' }));
  }, [dispatch]);

  // Aggregate stats across all employees
  const totalEmployees = employees.length;
  const pendingApprovalsCount = records.filter((r) => r.status === 'pending').length;
  const totalUnpaidLiability = employees.reduce(
    (sum, emp) => sum + (emp.netUnpaidBalance ?? 0),
    0,
  );
  const totalPaidAllTime = employees.reduce(
    (sum, emp) => sum + (emp.totalPaidSalary ?? 0),
    0,
  );

  const handleSelectForPayroll = (empId: string) => {
    setTargetPayrollEmployeeId(empId);
    setActiveTab('payroll');
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Employees */}
        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Employees
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900 truncate">{totalEmployees}</div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">Active personnel</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Pending
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-amber-600 truncate">
            {pendingApprovalsCount}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">Awaiting approval</p>
        </div>

        {/* Total Unpaid Balance */}
        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-indigo-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Unpaid Due
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-black text-indigo-600 truncate">
            ₹{totalUnpaidLiability.toFixed(2)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">Wages owed to staff</p>
        </div>

        {/* Total Paid Out */}
        <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Disbursed
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-slate-900 truncate">
            ₹{totalPaidAllTime.toFixed(2)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">Historical payouts</p>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="bg-white p-1 sm:p-1.5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-4 sm:flex sm:items-center sm:space-x-2 gap-1 sm:gap-0">
        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'approvals'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {pendingApprovalsCount > 0 && (
              <span className="sm:hidden absolute -top-1.5 -right-2 px-1 min-w-[14px] h-3.5 bg-amber-400 text-slate-900 rounded-full text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                {pendingApprovalsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-xs tracking-tight sm:tracking-normal text-center leading-tight truncate max-w-full">
            <span className="sm:hidden">Approvals</span>
            <span className="hidden sm:inline">Timesheet Approvals</span>
          </span>
          {pendingApprovalsCount > 0 && (
            <span
              className={`hidden sm:inline ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'approvals'
                  ? 'bg-white/25 text-white'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('employees')}
          className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'employees'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span className="text-[10px] sm:text-xs tracking-tight sm:tracking-normal text-center leading-tight truncate max-w-full">
            <span className="sm:hidden">Employees</span>
            <span className="hidden sm:inline">Employees ({totalEmployees})</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payroll')}
          className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'payroll'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wallet className="w-4 h-4 shrink-0" />
          <span className="text-[10px] sm:text-xs tracking-tight sm:tracking-normal text-center leading-tight truncate max-w-full">
            <span className="sm:hidden">Payroll</span>
            <span className="hidden sm:inline">Payroll & Settlement</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rates')}
          className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 sm:py-2.5 px-1 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'rates'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4 shrink-0" />
          <span className="text-[10px] sm:text-xs tracking-tight sm:tracking-normal text-center leading-tight truncate max-w-full">
            <span className="sm:hidden">Rates</span>
            <span className="hidden sm:inline">Daily Rates & Overrides</span>
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'approvals' && <AdminApprovals />}
        {activeTab === 'employees' && (
          <AdminEmployees onSelectForPayroll={handleSelectForPayroll} />
        )}
        {activeTab === 'payroll' && (
          <AdminPayroll initialEmployeeId={targetPayrollEmployeeId} />
        )}
        {activeTab === 'rates' && <AdminRates />}
      </div>
    </div>
  );
};
