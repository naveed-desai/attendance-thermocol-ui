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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Net Unpaid Balance */}
      <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Unpaid Balance
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-indigo-600">
            ₹{summary?.netUnpaidBalance?.toFixed(2) ?? '0.00'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {summary?.approvedUnpaidCount ?? 0} approved shift(s) pending payment
        </p>
      </div>

      {/* Total Approved Earnings */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Approved
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-slate-900">
            ₹{summary?.totalApprovedEarnings?.toFixed(2) ?? '0.00'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Gross approved earnings to date</p>
      </div>

      {/* Total Paid Out */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Paid
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-slate-900">
            ₹{summary?.totalPaid?.toFixed(2) ?? '0.00'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {summary?.lastPaidDate
            ? `Last paid on ${new Date(summary.lastPaidDate).toLocaleDateString()}`
            : 'No payments made yet'}
        </p>
      </div>

      {/* Pending Approval */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Approval
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-amber-600">
            ₹{summary?.pendingEarnings?.toFixed(2) ?? '0.00'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {summary?.pendingCount ?? 0} shift(s) awaiting admin review
        </p>
      </div>
    </div>
  );
};
