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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Employees
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalEmployees}</div>
          <p className="mt-1 text-xs text-slate-500">Active personnel in system</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Timesheets
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {pendingApprovalsCount}
          </div>
          <p className="mt-1 text-xs text-slate-500">Shifts requiring approval</p>
        </div>

        {/* Total Unpaid Balance */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unpaid Liability
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-600">
            ₹{totalUnpaidLiability.toFixed(2)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Approved wages owed to staff</p>
        </div>

        {/* Total Paid Out */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Disbursed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            ₹{totalPaidAllTime.toFixed(2)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Historical settled disbursements</p>
        </div>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'approvals'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Timesheet Approvals</span>
          {pendingApprovalsCount > 0 && (
            <span
              className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
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
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'employees'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employees ({totalEmployees})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'payroll'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Payroll & Settlement</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rates')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'rates'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Daily Rates & Overrides</span>
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
