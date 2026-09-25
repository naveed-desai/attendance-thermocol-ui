import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { fetchPayrollSummary } from '../../store/slices/payrollSlice.ts';
import { Wallet, CheckCircle2, Clock, IndianRupee } from 'lucide-react';

interface EmployeeOverviewProps {
  employeeId: string;
}

export const EmployeeOverview: React.FC<EmployeeOverviewProps> = ({ employeeId }) => {
  const dispatch = useAppDispatch();
  const { summary, loading } = useAppSelector((state) => state.payroll);

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchPayrollSummary(employeeId));
    }
  }, [dispatch, employeeId]);

  if (loading && !summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 sm:h-28 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Net Unpaid Balance */}
      <div className="bg-white p-3 sm:p-5 rounded-2xl border border-indigo-100 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Unpaid Balance
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <span className="text-lg sm:text-2xl font-bold text-indigo-600 truncate block">
            ₹{summary?.netUnpaidBalance?.toFixed(2) ?? '0.00'}
          </span>
        </div>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
          {summary?.approvedUnpaidCount ?? 0} approved shift(s)
        </p>
      </div>

      {/* Total Approved Earnings */}
      <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Total Approved
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <span className="text-lg sm:text-2xl font-bold text-slate-900 truncate block">
            ₹{summary?.totalApprovedEarnings?.toFixed(2) ?? '0.00'}
          </span>
        </div>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">Gross approved</p>
      </div>

      {/* Total Paid Out */}
      <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Total Paid
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <span className="text-lg sm:text-2xl font-bold text-slate-900 truncate block">
            ₹{summary?.totalPaid?.toFixed(2) ?? '0.00'}
          </span>
        </div>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
          {summary?.lastPaidDate
            ? `Paid ${new Date(summary.lastPaidDate).toLocaleDateString()}`
            : 'No payouts yet'}
        </p>
      </div>

      {/* Pending Approval */}
      <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Pending
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2">
          <span className="text-lg sm:text-2xl font-bold text-amber-600 truncate block">
            ₹{summary?.pendingEarnings?.toFixed(2) ?? '0.00'}
          </span>
        </div>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
          {summary?.pendingCount ?? 0} shift(s) pending
        </p>
      </div>
    </div>
  );
};
