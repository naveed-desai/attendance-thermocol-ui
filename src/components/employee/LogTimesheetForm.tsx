import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import {
  createAttendance,
  checkoutAttendance,
} from '../../store/slices/attendanceSlice.ts';
import { api } from '../../api/client.ts';
import type { ResolvedRate } from '../../types/index.ts';
import { DatePickerInput } from '../common/DatePickerInput.tsx';
import { TimePickerInput } from '../common/TimePickerInput.tsx';
import {
  formatTo12Hour,
  timeStringToMinutes,
  getLocalDateString,
  roundTimeTo5Min,
} from '../../utils/time.ts';
import {
  Clock,
  IndianRupee,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  LogIn,
  LogOut,
} from 'lucide-react';

interface LogTimesheetFormProps {
  employeeId: string;
}

export const LogTimesheetForm: React.FC<LogTimesheetFormProps> = ({ employeeId }) => {
  const dispatch = useAppDispatch();
  const { submitting, records } = useAppSelector((state) => state.attendance);
  const { list: employees } = useAppSelector((state) => state.employees);

  const { currentUser } = useAppSelector((state) => state.auth);
  const activeEmployee =
    employees.find((e) => e._id === employeeId) ||
    (currentUser?._id === employeeId ? currentUser : null);

  const todayStr = useMemo(() => getLocalDateString(), []);
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00 AM');
  // Check-Out is empty by default because of potential overtime
  const [endTime, setEndTime] = useState('');
  const [rate8h, setRate8h] = useState<number>(240);

  const [resolvedRateInfo, setResolvedRateInfo] = useState<ResolvedRate | null>(null);
  const [fetchingRate, setFetchingRate] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if an attendance entry already exists for the selected date
  const existingShift = useMemo(() => {
    return records.find((r) => {
      const matchEmp =
        typeof r.employeeId === 'string'
          ? r.employeeId === employeeId
          : r.employeeId?._id === employeeId;
      return matchEmp && r.date === date;
    });
  }, [records, employeeId, date]);

  const hasActiveCheckin = !!(existingShift && !existingShift.endTime);
  const isShiftCompleted = !!(existingShift && existingShift.endTime);

  // Fetch resolved rate whenever date or activeEmployee changes
  useEffect(() => {
    let isMounted = true;
    const loadRate = async () => {
      try {
        setFetchingRate(true);
        const resolved = await api.rates.resolve(date, activeEmployee?.customDailyRate);
        if (isMounted) {
          setResolvedRateInfo(resolved);
          setRate8h(resolved.rate8h);
        }
      } catch (err) {
        console.error('Failed to resolve rate for date', err);
      } finally {
        if (isMounted) setFetchingRate(false);
      }
    };
    loadRate();
    return () => {
      isMounted = false;
    };
  }, [date, activeEmployee?.customDailyRate]);

  // If active shift has checkin, use its start time for calculation
  const effectiveStartTime = hasActiveCheckin
    ? existingShift.startTime
    : startTime;

  // Default evening checkout time (e.g. 05:00 PM or 8h after check-in in the evening)
  const defaultEveningCheckout = useMemo(() => {
    if (effectiveStartTime) {
      const startMins = timeStringToMinutes(effectiveStartTime);
      const endMins = (startMins + 8 * 60) % (24 * 60);
      if (endMins >= 720) {
        let h = Math.floor(endMins / 60);
        const m = endMins % 60;
        h = h % 12 || 12;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} PM`;
      }
    }
    return '05:00 PM';
  }, [effectiveStartTime]);

  // Live calculation of duration and salary when both times are available
  const metrics = useMemo(() => {
    if (!effectiveStartTime || !endTime) return null;
    const roundedStart = roundTimeTo5Min(effectiveStartTime, 'ceil');
    const roundedEnd = roundTimeTo5Min(endTime, 'floor');
    const startTotal = timeStringToMinutes(roundedStart);
    const endTotal = timeStringToMinutes(roundedEnd);

    let durationMinutes = endTotal - startTotal;
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60; // Overnight shift
    }

    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const hoursWorkedDecimal = Math.round((durationMinutes / 60) * 100) / 100;
    const hourlyRate = rate8h / 8;
    // Daily salary floored to integer (no .50 or decimals)
    const calculatedSalary =
      Math.floor((durationMinutes / 480) * rate8h);

    let shiftType: 'standard' | 'overtime' | 'undertime' = 'standard';
    if (durationMinutes > 480) shiftType = 'overtime';
    else if (durationMinutes < 480) shiftType = 'undertime';

    return {
      durationMinutes,
      hours,
      mins,
      hoursWorkedDecimal,
      hourlyRate,
      calculatedSalary,
      shiftType,
      roundedStart,
      roundedEnd,
    };
  }, [effectiveStartTime, endTime, rate8h]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!employeeId) {
      setFormError('Please select an employee first');
      return;
    }

    // Case 1: Active checkin exists -> completing checkout
    if (hasActiveCheckin && existingShift) {
      if (!endTime) {
        setFormError('Please enter your check-out time');
        return;
      }

      if (!metrics || metrics.durationMinutes <= 0) {
        setFormError('Invalid checkout time: must be later than check-in time');
        return;
      }

      const finalEndTime = roundTimeTo5Min(endTime, 'floor');

      try {
        await dispatch(
          checkoutAttendance({
            id: existingShift._id,
            endTime: finalEndTime,
            employeeId,
          }),
        ).unwrap();

        setSuccessMessage(
          `Check-out recorded at ${formatTo12Hour(finalEndTime)} for ${date}! Total: ${metrics.hours}h ${metrics.mins}m (₹${metrics.calculatedSalary.toFixed(2)}).`,
        );
        setEndTime('');
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (err: unknown) {
        setFormError(
          typeof err === 'string'
            ? err
            : (err as Error)?.message || 'Failed to complete check-out',
        );
      }
      return;
    }

    // Case 2: Logging check-in only (no checkout provided yet)
    if (!endTime) {
      const finalStartTime = roundTimeTo5Min(startTime, 'ceil');
      try {
        await dispatch(
          createAttendance({
            employeeId,
            date,
            startTime: finalStartTime,
            dailyRate8h: Number(rate8h),
          }),
        ).unwrap();

        setSuccessMessage(
          `Check-in recorded at ${formatTo12Hour(finalStartTime)} on ${date}! You can log check-out when your shift finishes.`,
        );
        setTimeout(() => setSuccessMessage(null), 5000);
      } catch (err: unknown) {
        setFormError(
          typeof err === 'string'
            ? err
            : (err as Error)?.message || 'Failed to log check-in',
        );
      }
      return;
    }

    // Case 3: Logging both at once
    if (!metrics || metrics.durationMinutes <= 0) {
      setFormError('Invalid shift hours: duration must be greater than 0 minutes');
      return;
    }

    const finalStartTime = roundTimeTo5Min(startTime, 'ceil');
    const finalEndTime = roundTimeTo5Min(endTime, 'floor');

    try {
      await dispatch(
        createAttendance({
          employeeId,
          date,
          startTime: finalStartTime,
          endTime: finalEndTime,
          dailyRate8h: Number(rate8h),
        }),
      ).unwrap();

      setSuccessMessage(
        `Timesheet for ${date} (${formatTo12Hour(finalStartTime)} – ${formatTo12Hour(finalEndTime)}) logged successfully! Awaiting admin approval.`,
      );
      setEndTime('');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      setFormError(
        typeof err === 'string'
          ? err
          : (err as Error)?.message || 'Failed to submit timesheet',
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Log Daily Attendance</h2>
          <p className="text-xs text-slate-500">
            Record shift check-in, check-out, or both at once
          </p>
        </div>
        {/* Dynamic Rate Badge */}
        {resolvedRateInfo && (
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 ${
              resolvedRateInfo.bonus8h > 0
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {resolvedRateInfo.bonus8h > 0
                ? `Special Date Bonus (+₹${resolvedRateInfo.bonus8h}): ₹${resolvedRateInfo.rate8h}/8h`
                : `Daily Rate: ₹${resolvedRateInfo.rate8h}/8h`}
            </span>
          </div>
        )}
      </div>

      {formError && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-700 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* State Notification Banners */}
      {hasActiveCheckin && existingShift && (
        <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-amber-900 text-xs">
                Active Shift in Progress ({existingShift.date})
              </div>
              <div className="text-[11px] text-amber-700">
                You checked in at <strong className="font-bold">{formatTo12Hour(existingShift.startTime)}</strong>. Enter your check-out time below to complete this shift.
              </div>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
            Awaiting Checkout
          </span>
        </div>
      )}

      {isShiftCompleted && existingShift && (
        <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block">
              Shift for {existingShift.date} has been fully recorded
            </span>
            <span className="text-emerald-700 text-[11px]">
              {formatTo12Hour(existingShift.startTime)} – {formatTo12Hour(existingShift.endTime)} ({existingShift.hoursWorked} hrs • ₹{existingShift.calculatedSalary.toFixed(2)}) • Status: <strong className="capitalize">{existingShift.status}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Form (only active if shift not completed yet) */}
      {!isShiftCompleted && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Work Date */}
            <DatePickerInput
              value={date}
              onChange={(newDate) => setDate(newDate)}
              disabled={hasActiveCheckin}
              label="Work Date"
              helperText={
                resolvedRateInfo
                  ? resolvedRateInfo.bonus8h > 0
                    ? `${resolvedRateInfo.dayOfWeek} (Special Date Bonus: +₹${resolvedRateInfo.bonus8h})`
                    : resolvedRateInfo.dayOfWeek
                  : undefined
              }
            />

            {/* Start Time (Check-In) */}
            <TimePickerInput
              value={hasActiveCheckin && existingShift ? existingShift.startTime : startTime}
              onChange={(newTime) => setStartTime(newTime)}
              disabled={hasActiveCheckin}
              label="Check-In Time (12h)"
              badge={
                hasActiveCheckin ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                    Logged
                  </span>
                ) : undefined
              }
              roundMode="ceil"
              presets={['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM']}
            />

            {/* End Time (Check-Out) */}
            <TimePickerInput
              value={endTime}
              onChange={(newTime) => setEndTime(newTime)}
              label="Check-Out Time (12h)"
              placeholder="--:-- --"
              allowClear={true}
              defaultPeriod="PM"
              defaultTimeOnOpen={defaultEveningCheckout}
              roundMode="floor"
              helperText="Automatically set to evening when opened"
              presets={['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '08:00 PM']}
            />
          </div>

          {/* Real-time Calculation Preview Card (when both checkin and checkout are specified) */}
          {metrics && (
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 p-4 rounded-xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Duration</span>
                  <div className="font-bold text-slate-900 text-lg">
                    {metrics.hours}h {metrics.mins}m{' '}
                    <span className="text-xs font-normal text-slate-500">
                      ({metrics.hoursWorkedDecimal} hrs)
                    </span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                  <span className="text-xs font-semibold text-slate-500">Shift Type</span>
                  <div>
                    {metrics.shiftType === 'overtime' ? (
                      <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                        Overtime (+{(metrics.hoursWorkedDecimal - 8).toFixed(1)}h)
                      </span>
                    ) : metrics.shiftType === 'undertime' ? (
                      <span className="inline-flex items-center text-xs font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                        Partial Shift ({(8 - metrics.hoursWorkedDecimal).toFixed(1)}h less)
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        Exact 8h Shift
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500">
                  Calculated Earnings
                </span>
                <div className="text-2xl font-black text-indigo-600">
                  ₹{metrics.calculatedSalary.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Action Submission Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400">
              {hasActiveCheckin ? (
                <span>Submit check-out to calculate final wages and send for approval.</span>
              ) : !endTime ? (
                <span>Logging check-in now. You can log check-out when your shift ends.</span>
              ) : (
                <span>Logging both check-in and check-out at once.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || fetchingRate}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center space-x-2 cursor-pointer shrink-0"
            >
              {submitting ? (
                <span>Processing...</span>
              ) : hasActiveCheckin ? (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Complete Check-Out</span>
                </>
              ) : !endTime ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log Check-In</span>
                </>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4" />
                  <span>Submit Full Timesheet</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
