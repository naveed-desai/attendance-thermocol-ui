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

export const AdminRates: React.FC = () => {
  const dispatch = useAppDispatch();
  const { overrides, loading } = useAppSelector((state) => state.rates);

  const [date, setDate] = useState('');
  const [rate8h, setRate8h] = useState<number>(260);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

    if (rate8h <= 0) {
      setFormError('Rate must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(
        setOverride({
          date,
          rate8h: Number(rate8h),
          reason: reason.trim() || undefined,
        }),
      ).unwrap();

      setSuccessMsg(`Rate override of ₹${rate8h} saved for date ${date}!`);
      setDate('');
      setReason('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      setFormError(
        typeof err === 'string'
          ? err
          : (err as Error)?.message || 'Failed to save rate override',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (targetDate: string) => {
    if (window.confirm(`Delete rate override for ${targetDate}?`)) {
      await dispatch(deleteOverride(targetDate));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Info Banner */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Daily Rate Configurations</h2>
        <p className="text-xs text-slate-500">
          Configure baseline rates and set custom rates for special calendar dates
        </p>
      </div>

      {/* Baseline Rate Rules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Regular Days */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            Mon-Sat
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">
              Standard Daily Baseline
            </div>
            <div className="text-xl font-bold text-slate-900">
              ₹240 <span className="text-xs font-normal text-slate-500">/ 8h shift</span>
            </div>
            <div className="text-xs text-slate-400">
              Linear hourly rate: ₹30.00/hr (overtime calculated at same rate)
            </div>
          </div>
        </div>

        {/* Sundays */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            Sunday
          </div>
          <div>
            <div className="text-xs text-amber-800 font-medium flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sunday Special Baseline</span>
            </div>
            <div className="text-xl font-bold text-slate-900">
              ₹250 <span className="text-xs font-normal text-slate-500">/ 8h shift</span>
            </div>
            <div className="text-xs text-slate-400">
              Linear hourly rate: ₹31.25/hr (applied automatically to all Sundays)
            </div>
          </div>
        </div>
      </div>

      {/* Set Override Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 mb-1">
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Set Custom Date Override</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Override the rate for a specific holiday, festival, or special incentive day
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
              8-Hour Rate (₹) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                step="1"
                value={rate8h}
                onChange={(e) => setRate8h(Number(e.target.value))}
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
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center space-x-1"
            >
              <span>{submitting ? 'Saving...' : 'Save Rate'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Overrides Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Active Custom Date Overrides</h3>
          <span className="text-xs text-slate-500">{overrides.length} override(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Rate (8h)</th>
                <th className="py-3 px-4">Hourly Equivalent</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && overrides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading overrides...
                  </td>
                </tr>
              ) : overrides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <Info className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No custom date overrides</p>
                    <p className="text-xs text-slate-400">
                      Standard rates apply: ₹240 for Mon–Sat and ₹250 for Sundays.
                    </p>
                  </td>
                </tr>
              ) : (
                overrides.map((ov) => (
                  <tr key={ov.date} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {ov.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-600">
                      ₹{ov.rate8h}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      ₹{(ov.rate8h / 8).toFixed(2)}/hr
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {ov.reason || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(ov.date)}
                        title="Delete override"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
