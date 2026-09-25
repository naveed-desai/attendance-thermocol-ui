import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import {
  fetchPayrollSummary,
  settlePayroll,
} from '../../store/slices/payrollSlice.ts';
import type { PaymentType } from '../../types/index.ts';
import {
  IndianRupee,
  Wallet,
  CheckCircle2,
  Calendar,
  CreditCard,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect.tsx';
import { Pagination } from '../common/Pagination.tsx';

interface AdminPayrollProps {
  initialEmployeeId?: string;
}

export const AdminPayroll: React.FC<AdminPayrollProps> = ({
  initialEmployeeId,
}) => {
  const dispatch = useAppDispatch();
  const { list: employees } = useAppSelector((state) => state.employees);
  const { summary, loading, settling } = useAppSelector((state) => state.payroll);

  const [selectedId, setSelectedId] = useState<string>('');
  const selectedEmployeeId =
    selectedId || initialEmployeeId || (employees.length > 0 ? employees[0]._id : '');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [paymentType, setPaymentType] = useState<PaymentType>('full');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [note, setNote] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedEmployeeId]);

  const payouts = summary?.payouts ?? [];
  const totalPages = Math.max(1, Math.ceil(payouts.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedPayouts = payouts.slice(startIndex, startIndex + pageSize);

  const employeeOptions = useMemo(() => {
    return employees.map((emp) => ({
      value: emp._id,
      label: emp.name,
      badge: `₹${emp.netUnpaidBalance ?? 0} due`,
      sublabel: emp.phone,
    }));
  }, [employees]);

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash in Hand' },
    { value: 'bank_transfer', label: 'Direct Bank Transfer' },
    { value: 'upi', label: 'UPI / Mobile Payment' },
    { value: 'cheque', label: 'Cheque' },
  ];

  useEffect(() => {
    if (selectedEmployeeId) {
      dispatch(fetchPayrollSummary(selectedEmployeeId));
    }
  }, [dispatch, selectedEmployeeId]);

  const unpaidBalance = summary?.netUnpaidBalance ?? 0;

  const effectiveAmountToPay =
    paymentType === 'full' ? unpaidBalance : Number(partialAmount) || 0;

  const remainingBalanceAfter = Math.max(
    0,
    Math.round((unpaidBalance - effectiveAmountToPay) * 100) / 100,
  );

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedEmployeeId) {
      setErrorMsg('Please select an employee');
      return;
    }

    if (unpaidBalance <= 0) {
      setErrorMsg('Employee has zero outstanding unpaid balance');
      return;
    }

    if (effectiveAmountToPay <= 0) {
      setErrorMsg('Payment amount must be greater than 0');
      return;
    }

    if (effectiveAmountToPay > unpaidBalance) {
      setErrorMsg(
        `Payment amount cannot exceed outstanding balance of ₹${unpaidBalance}`,
      );
      return;
    }

    try {
      await dispatch(
        settlePayroll({
          employeeId: selectedEmployeeId,
          amountPaid: effectiveAmountToPay,
          paymentType,
          paymentMethod,
          note: note.trim() || undefined,
        }),
      ).unwrap();

      setSuccessMsg(
        `Successfully disbursed ₹${effectiveAmountToPay.toFixed(
          2,
        )} (${paymentType} settlement). New balance: ₹${remainingBalanceAfter.toFixed(
          2,
        )}`,
      );
      setNote('');
      if (paymentType === 'partial') setPartialAmount('');
    } catch (err: unknown) {
      setErrorMsg(
        typeof err === 'string'
          ? err
          : (err as Error)?.message || 'Failed to process settlement',
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Employee Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Payroll & Settlement</h2>
          <p className="text-xs text-slate-500">
            Settle accrued approved earnings in Full or Partial amounts and view disbursement receipts
          </p>
        </div>

        {/* Employee Select */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Employee:</span>
          <CustomSelect
            value={selectedEmployeeId}
            onChange={(val) => {
              setSelectedId(val);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            options={employeeOptions}
            placeholder="Select employee..."
            className="min-w-[200px]"
          />
        </div>
      </div>

      {/* Financial Metrics Cards for Selected Employee */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {/* Net Unpaid Balance */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-indigo-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Outstanding Due
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-3xl font-black text-indigo-600 truncate">
            ₹{unpaidBalance.toFixed(2)}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
            {summary?.approvedUnpaidCount ?? 0} shift(s) ready
          </p>
        </div>

        {/* Gross Approved */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Total Approved
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900 truncate">
            ₹{summary?.totalApprovedEarnings?.toFixed(2) ?? '0.00'}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">Approved work</p>
        </div>

        {/* Total Paid Out */}
        <div className="col-span-2 sm:col-span-1 bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Total Disbursed
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900 truncate">
            ₹{summary?.totalPaid?.toFixed(2) ?? '0.00'}
          </div>
          <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">
            Across {summary?.payouts?.length ?? 0} disbursement(s)
          </p>
        </div>
      </div>

      {/* Settlement Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-base font-bold text-slate-900 mb-1">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          <span>Execute Settlement Payout</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Choose Full Settlement to clear the balance to ₹0, or Partial Settlement to disburse a partial amount.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-700 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSettle} className="space-y-4">
          {/* Payment Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                paymentType === 'full'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="paymentType"
                  value="full"
                  checked={paymentType === 'full'}
                  onChange={() => setPaymentType('full')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Full Settlement
                  </div>
                  <div className="text-xs text-slate-500">
                    Pay complete balance (₹{unpaidBalance.toFixed(2)}) $\to$ balance resets to ₹0
                  </div>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </label>

            <label
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                paymentType === 'partial'
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="paymentType"
                  value="partial"
                  checked={paymentType === 'partial'}
                  onChange={() => setPaymentType('partial')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Partial Settlement
                  </div>
                  <div className="text-xs text-slate-500">
                    Pay custom amount $\le$ ₹{unpaidBalance.toFixed(2)} $\to$ remainder rolls forward
                  </div>
                </div>
              </div>
            </label>
          </div>

          {/* Amount, Method, Notes Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disbursement Amount (₹) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={unpaidBalance}
                  step="0.01"
                  required
                  disabled={paymentType === 'full'}
                  value={paymentType === 'full' ? unpaidBalance : partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
                />
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <CustomSelect
                value={paymentMethod}
                onChange={(val) => setPaymentMethod(val)}
                options={paymentMethodOptions}
                fullWidth={true}
                className="bg-slate-50 py-2 text-sm"
              />
            </div>

            {/* Note / Reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes / Voucher Ref (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Voucher #104, Week 3 salary"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Dynamic Balance Preview Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-4 text-xs">
              <div>
                <span className="text-slate-400">Balance Before: </span>
                <span className="font-bold text-slate-700">₹{unpaidBalance.toFixed(2)}</span>
              </div>
              <span>&minus;</span>
              <div>
                <span className="text-slate-400">Paying Now: </span>
                <span className="font-bold text-indigo-600">
                  ₹{effectiveAmountToPay.toFixed(2)}
                </span>
              </div>
              <span>=</span>
              <div>
                <span className="text-slate-400">Balance After: </span>
                <span
                  className={`font-black ${
                    remainingBalanceAfter === 0 ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  ₹{remainingBalanceAfter.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={settling || unpaidBalance <= 0 || effectiveAmountToPay <= 0}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center space-x-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>{settling ? 'Processing...' : 'Confirm Disbursement'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Past Payouts History Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Disbursement History & Receipts</h3>
          </div>
          <span className="text-xs text-slate-500">
            {summary?.payouts?.length ?? 0} transaction(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Disbursed At</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Balance Before</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && !summary ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
                    <span>Loading payment history...</span>
                  </td>
                </tr>
              ) : summary?.payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Calendar className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No payment history</p>
                    <p className="text-xs text-slate-400">
                      No disbursements have been recorded for this employee yet.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedPayouts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      {new Date(p.paidAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      ₹{p.amountPaid.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                          p.paymentType === 'full'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      ₹{p.balanceBefore.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{p.balanceAfter.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600 text-xs">
                      {p.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {p.note || <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {payouts.length > 0 && (
          <Pagination
            currentPage={safeCurrentPage}
            totalItems={payouts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50, 100]}
          />
        )}
      </div>
    </div>
  );
};
