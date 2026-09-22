import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import {
  fetchAttendance,
  updateAttendanceStatus,
} from '../../store/slices/attendanceSlice.ts';
import type { AttendanceStatus } from '../../types/index.ts';
import {
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Filter,
} from 'lucide-react';
import { formatTo12Hour } from '../../utils/time.ts';
import { CustomSelect } from '../common/CustomSelect.tsx';

export const AdminApprovals: React.FC = () => {
  const dispatch = useAppDispatch();
  const { records, loading } = useAppSelector((state) => state.attendance);
  const { list: employees } = useAppSelector((state) => state.employees);

  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const employeeOptions = useMemo(() => {
    return [
      { value: '', label: 'All Employees' },
      ...employees.map((emp) => ({
        value: emp._id,
        label: emp.name,
        sublabel: emp.phone,
      })),
    ];
  }, [employees]);

  useEffect(() => {
    dispatch(
      fetchAttendance({
        employeeId: selectedEmployeeId || undefined,
        status: statusFilter === 'all' ? undefined : (statusFilter as AttendanceStatus),
      }),
    );
  }, [dispatch, statusFilter, selectedEmployeeId]);

  const handleApprove = async (id: string) => {
    await dispatch(
      updateAttendanceStatus({
        id,
        status: 'approved',
        approvedBy: 'Admin',
      }),
    );
  };

  const handleOpenReject = (id: string) => {
    setRejectingId(id);
    setRejectionReason('Incorrect shift duration logged');
  };

  const handleConfirmReject = async (id: string) => {
    await dispatch(
      updateAttendanceStatus({
        id,
        status: 'rejected',
        rejectionReason: rejectionReason || undefined,
        approvedBy: 'Admin',
      }),
    );
    setRejectingId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Timesheet Approvals Queue</h2>
          <p className="text-xs text-slate-500">
            Review and approve employee logged hours before wages are added to unpaid ledger
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Employee Filter */}
          <CustomSelect
            value={selectedEmployeeId}
            onChange={(val) => setSelectedEmployeeId(val)}
            options={employeeOptions}
            placeholder="All Employees"
            icon={<Filter className="w-3.5 h-3.5" />}
          />

          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['pending', 'approved', 'rejected', 'all'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timesheets List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Date & Day</th>
                <th className="py-3 px-4">Shift Hours</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">8h Rate</th>
                <th className="py-3 px-4">Calculated Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <Clock className="w-5 h-5 animate-spin text-indigo-500" />
                      <span>Loading approval queue...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No timesheets found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {statusFilter === 'pending'
                        ? 'No pending timesheets awaiting approval. All caught up!'
                        : `No records found matching status "${statusFilter}".`}
                    </p>
                  </td>
                </tr>
              ) : (
                records.map((item) => {
                  const empName =
                    typeof item.employeeId === 'object' && item.employeeId !== null
                      ? item.employeeId.name
                      : 'Unknown Employee';
                  const empEmail =
                    typeof item.employeeId === 'object' && item.employeeId !== null
                      ? item.employeeId.email
                      : '';

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Employee */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{empName}</div>
                        <div className="text-xs text-slate-400">{empEmail}</div>
                      </td>

                      {/* Date & Day */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{item.date}</div>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                          <span>{item.dayOfWeek}</span>
                          {item.isSunday && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                              Sunday
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Shift Hours */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                        {item.endTime ? (
                          <span>
                            {formatTo12Hour(item.startTime)} – {formatTo12Hour(item.endTime)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
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
                              {item.hoursWorked} hrs{' '}
                              {item.durationMinutes > 480 ? (
                                <span className="text-amber-600 font-semibold">(OT)</span>
                              ) : item.durationMinutes < 480 ? (
                                <span className="text-blue-600 font-semibold">(Part)</span>
                              ) : null}
                            </div>
                          </>
                        ) : (
                          <span className="text-amber-600 text-xs font-semibold">
                            Shift in progress
                          </span>
                        )}
                      </td>

                      {/* 8h Rate */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        ₹{item.dailyRate8h}
                      </td>

                      {/* Calculated Salary */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.endTime
                          ? `₹${item.calculatedSalary.toFixed(2)}`
                          : '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {!item.endTime ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <span>Checked In</span>
                          </span>
                        ) : item.status === 'pending' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        ) : item.status === 'approved' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
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

                      {/* Approval Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {!item.endTime ? (
                          <span className="text-xs text-amber-600 font-medium">
                            Awaiting Checkout
                          </span>
                        ) : item.status === 'pending' ? (
                          <div className="flex items-center justify-end space-x-2">
                            {rejectingId === item._id ? (
                              <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                                <input
                                  type="text"
                                  placeholder="Rejection reason..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg w-36 focus:outline-hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleConfirmReject(item._id)}
                                  className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                                  title="Confirm Reject"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectingId(null)}
                                  className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(item._id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReject(item._id)}
                                  className="px-2.5 py-1 border border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 text-slate-600 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {item.status === 'approved'
                              ? item.paymentStatus === 'paid'
                                ? 'Settled & Paid'
                                : 'Awaiting Payment'
                              : 'Closed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
