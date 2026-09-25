import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import {
  fetchOverrides,
  setOverride,
  deleteOverride,
} from '../../store/slices/ratesSlice.ts';
import {
  IndianRupee,
  Plus,
  Trash2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { DatePickerInput } from '../common/DatePickerInput.tsx';
import { Pagination } from '../common/Pagination.tsx';

export const AdminRates: React.FC = () => {
  const dispatch = useAppDispatch();
  const { overrides, loading } = useAppSelector((state) => state.rates);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [date, setDate] = useState('');
  const [bonus8h, setBonus8h] = useState<number>(10);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(overrides.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedOverrides = overrides.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    dispatch(fetchOverrides());
  }, [dispatch]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!date) {
      setFormError('Please select a calendar date');
      return;
    }

    if (bonus8h <= 0) {
      setFormError('Daily bonus increment must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(
        setOverride({
          date,
          bonus8h: Number(bonus8h),
          reason: reason.trim() || undefined,
        }),
      ).unwrap();

      setSuccessMsg(
        `Date salary bonus of +₹${bonus8h} saved for ${date}! All employees will receive +₹${bonus8h} on top of their base daily wage on this date.`,
      );
      setDate('');
      setReason('');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: unknown) {
      setFormError(
        typeof err === 'string'
          ? err
          : (err as Error)?.message || 'Failed to save date bonus',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (targetDate: string) => {
    if (window.confirm(`Delete rate bonus for ${targetDate}?`)) {
      await dispatch(deleteOverride(targetDate));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Info Banner */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Salary Rate & Bonus Configurations</h2>
        <p className="text-xs text-slate-500">
          Review employee base wage policies and configure date-specific bonus increments
        </p>
      </div>

      {/* Baseline Rate Rules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Rule */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
            Mon-Sun
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">
              Individual Employee Base Daily Wages
            </div>
            <div className="text-base font-bold text-slate-900">
              Configured Per Employee
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Set during employee registration. All shifts across all 7 days of the week (Monday through Sunday) are calculated using each employee's assigned rate (no automatic Sunday extra).
            </div>
          </div>
        </div>

        {/* Date Bonus Rule */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
            <Sparkles className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="text-xs text-amber-800 font-medium flex items-center space-x-1">
              <span>Date Bonus Increment Rule</span>
            </div>
            <div className="text-base font-bold text-slate-900">
              Additive To All Base Rates (+₹)
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Increases every employee's salary by this bonus amount on that day (e.g. +₹10 on date X turns base ₹240 ➔ ₹250 and base ₹250 ➔ ₹260).
            </div>
          </div>
        </div>
      </div>

      {/* Set Date Bonus Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 mb-1">
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Add Date Salary Bonus / Increment</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Add an extra bonus to all employees' daily wages for a specific date (e.g. festival bonus or special incentive)
        </p>

        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-700 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <DatePickerInput
              value={date}
              onChange={(newDate) => setDate(newDate)}
              label="Select Date *"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Bonus (+₹) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                step="1"
                placeholder="e.g. 10, 20, 50"
                value={bonus8h}
                onChange={(e) => setBonus8h(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Festival Holiday Bonus"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>{submitting ? 'Saving...' : 'Save Bonus'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Overrides Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Active Date Salary Bonus Increments</h3>
          <span className="text-xs text-slate-500">{overrides.length} date rule(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Daily Bonus</th>
                <th className="py-3 px-4">Effect on ₹240 Base</th>
                <th className="py-3 px-4">Effect on ₹250 Base</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && overrides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading date rules...
                  </td>
                </tr>
              ) : overrides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Info className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No date-specific salary bonuses configured</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      All shifts are calculated using each employee's configured daily wage.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedOverrides.map((ov) => {
                  const bonus =
                    ov.bonus8h !== undefined && ov.bonus8h !== null
                      ? ov.bonus8h
                      : ov.rate8h !== undefined
                      ? Math.max(0, ov.rate8h - 240)
                      : 0;

                  return (
                    <tr key={ov.date} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {ov.date}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        +₹{bonus}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          / 8h
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        ₹{240 + bonus}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          (₹{((240 + bonus) / 8).toFixed(2)}/hr)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        ₹{250 + bonus}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          (₹{((250 + bonus) / 8).toFixed(2)}/hr)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {ov.reason || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(ov.date)}
                          title="Delete bonus rule"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {overrides.length > 0 && (
          <Pagination
            currentPage={safeCurrentPage}
            totalItems={overrides.length}
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
