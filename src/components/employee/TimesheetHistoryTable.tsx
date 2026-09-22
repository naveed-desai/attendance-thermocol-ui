import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import {
  fetchAttendance,
  deleteAttendance,
  checkoutAttendance,
} from '../../store/slices/attendanceSlice.ts';
import {
  Clock,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  LogOut,
} from 'lucide-react';
import { formatTo12Hour, getCurrentTime12Hour } from '../../utils/time.ts';

interface TimesheetHistoryTableProps {
  employeeId: string;
}

export const TimesheetHistoryTable: React.FC<TimesheetHistoryTableProps> = ({
  employeeId,
}) => {
  const dispatch = useAppDispatch();
  const { records, loading } = useAppSelector((state) => state.attendance);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchAttendance({ employeeId }));
    }
  }, [dispatch, employeeId]);

  const filteredRecords = records.filter((rec) => {
    if (filterStatus === 'all') return true;
    return rec.status === filterStatus;
  });

  const handleDelete = async (id: string, date: string) => {
    if (window.confirm(`Are you sure you want to delete the pending timesheet for ${date}?`)) {
      await dispatch(deleteAttendance(id));
    }
  };

  const handleQuickCheckout = async (id: string, date: string, startTime: string) => {
    const defaultTime = getCurrentTime12Hour();
    const formattedStart = formatTo12Hour(startTime);
    const checkoutTime = window.prompt(
      `Enter Check-Out time for ${date} (Checked in at ${formattedStart}):\nFormat e.g. 05:30 PM:`,
      defaultTime,
    );
    if (!checkoutTime) return;
    const cleaned = checkoutTime.trim();
    if (
      !/^(([01]\d|2[0-3]):([0-5]\d)|(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM|am|pm))$/i.test(
        cleaned,
      )
    ) {
      alert('Invalid time format. Please use 12-hour format (e.g. 05:30 PM or 06:00 PM)');
      return;
    }
    const finalFormatted = formatTo12Hour(cleaned);
    await dispatch(checkoutAttendance({ id, endTime: finalFormatted, employeeId }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header & Filter Tabs */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Timesheet History</h2>
          <p className="text-xs text-slate-500">
            View status, hours, and calculated earnings for all logged shifts
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Shift Hours</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">8h Rate</th>
              <th className="py-3 px-4">Earned Salary</th>
              <th className="py-3 px-4">Approval</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading && records.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-5 h-5 animate-spin text-indigo-500" />
                    <span>Loading timesheets...</span>
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-medium text-slate-600">No timesheets found</p>
                  <p className="text-xs text-slate-400">
                    {filterStatus === 'all'
                      ? 'No attendance records logged yet.'
                      : `No records match status: "${filterStatus}".`}
                  </p>
                </td>
              </tr>
            ) : (
              filteredRecords.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Date & Day */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{item.date}</div>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                      <span>{item.dayOfWeek}</span>
                      {item.isSunday && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          Sun
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Shift Time */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                    {item.endTime ? (
                      <span>
                        {formatTo12Hour(item.startTime)} – {formatTo12Hour(item.endTime)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                        <Clock className="w-3 h-3 text-emerald-600 animate-pulse" />
                        <span>In: {formatTo12Hour(item.startTime)} (Active)</span>
                      </span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4">
                    {item.endTime ? (
                      <>
                        <div className="font-medium text-slate-900">
                          {Math.floor(item.durationMinutes / 60)}h{' '}
                          {item.durationMinutes % 60}m
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.hoursWorked} hrs
                        </div>
                      </>
                    ) : (
                      <span className="text-amber-600 text-xs font-semibold">
                        Shift in progress
                      </span>
                    )}
                  </td>

                  {/* 8h Rate */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    ₹{item.dailyRate8h}
                  </td>

                  {/* Calculated Salary */}
                  <td className="py-3.5 px-4">
                    {item.endTime ? (
                      <span className="font-bold text-slate-900">
                        ₹{item.calculatedSalary.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">
                        At checkout
                      </span>
                    )}
                  </td>

                  {/* Approval Status Badge */}
                  <td className="py-3.5 px-4">
                    {!item.endTime ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Clock className="w-3 h-3" />
                        <span>Checked In</span>
                      </span>
                    ) : item.status === 'pending' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    ) : item.status === 'approved' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>Approved</span>
                      </span>
                    ) : (
                      <span
                        title={item.rejectionReason}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 cursor-help"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Rejected</span>
                      </span>
                    )}
                  </td>

                  {/* Payment Status Badge */}
                  <td className="py-3.5 px-4">
                    {item.paymentStatus === 'paid' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                        Unpaid
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {!item.endTime && (
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickCheckout(item._id, item.date, item.startTime)
                          }
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center space-x-1"
                          title="Complete Check-Out for this shift"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Check Out</span>
                        </button>
                      )}
                      {item.status === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id, item.date)}
                          title="Delete timesheet"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
