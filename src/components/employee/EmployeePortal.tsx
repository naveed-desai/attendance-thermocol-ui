import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { fetchEmployees } from '../../store/slices/employeesSlice.ts';
import { setActiveEmployeeId, setRole } from '../../store/slices/authSlice.ts';
import { EmployeeOverview } from './EmployeeOverview.tsx';
import { LogTimesheetForm } from './LogTimesheetForm.tsx';
import { TimesheetHistoryTable } from './TimesheetHistoryTable.tsx';
import { UserCheck, Users, ShieldAlert, Shield } from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect.tsx';

export const EmployeePortal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser, activeEmployeeId } = useAppSelector((state) => state.auth);
  const { list: employees, loading } = useAppSelector((state) => state.employees);

  const isEmployee = currentUser?.role === 'employee';

  useEffect(() => {
    // Only fetch employee directory if admin is inspecting/previewing
    if (!isEmployee) {
      dispatch(fetchEmployees(false));
    }
  }, [dispatch, isEmployee]);

  // If admin is previewing and hasn't chosen an employee, auto-select first
  useEffect(() => {
    if (!isEmployee && !activeEmployeeId && employees.length > 0) {
      dispatch(setActiveEmployeeId(employees[0]._id));
    }
  }, [isEmployee, activeEmployeeId, employees, dispatch]);

  // For employee, active target is ALWAYS strictly currentUser; for admin, lookup selected employee
  const activeEmployee = isEmployee
    ? currentUser
    : employees.find((e) => e._id === activeEmployeeId);

  const employeeOptions = useMemo(() => {
    return employees.map((emp) => ({
      value: emp._id,
      label: emp.name,
      badge: emp.phone,
    }));
  }, [employees]);

  // If admin and no employees exist in DB
  if (!isEmployee && !loading && employees.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Employees Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The database currently has no employees registered. Switch to the Admin view to add an employee and start logging attendance.
        </p>
        <button
          type="button"
          onClick={() => dispatch(setRole('admin'))}
          className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors inline-flex items-center space-x-2 cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Switch to Admin View to Add Employee</span>
        </button>
      </div>
    );
  }

  // If admin and no employee selected yet
  if (!isEmployee && !activeEmployee) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-slate-200 text-center shadow-xs">
        <UserCheck className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Select Employee Profile</h2>
        <p className="text-xs text-slate-500 mb-4">
          Choose which employee timesheet account to view and inspect:
        </p>
        <div className="space-y-2">
          {employees.map((emp) => (
            <button
              key={emp._id}
              type="button"
              onClick={() => dispatch(setActiveEmployeeId(emp._id))}
              className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="font-semibold text-slate-900 text-sm">{emp.name}</div>
                <div className="text-xs text-slate-500">
                  {emp.phone} {emp.email ? `• ${emp.email}` : ''}
                </div>
              </div>
              <span className="text-xs font-semibold text-indigo-600">Select &rarr;</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!activeEmployee) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Admin Preview Mode Banner */}
      {!isEmployee && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200/60">
                    Admin Preview
                  </span>
                  <span className="text-xs text-amber-800/80 font-medium">
                    Viewing as Employee
                  </span>
                </div>
                <div className="font-semibold text-slate-900 text-sm mt-0.5">
                  {activeEmployee.name} <span className="text-xs font-normal text-slate-500">({activeEmployee.phone})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200/60">
              <span className="text-xs font-semibold text-amber-950 shrink-0">
                Select Employee:
              </span>
              <div className="w-full sm:w-64">
                <CustomSelect
                  value={activeEmployeeId || ''}
                  onChange={(val) => dispatch(setActiveEmployeeId(val || null))}
                  options={employeeOptions}
                  placeholder="Select Employee..."
                  fullWidth={true}
                  className="w-full bg-white text-xs py-2 px-3 border-amber-200 shadow-2xs hover:border-amber-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Overview Metrics */}
      <EmployeeOverview employeeId={activeEmployee._id} />

      {/* Timesheet Submission Form */}
      <LogTimesheetForm employeeId={activeEmployee._id} />

      {/* Timesheet History Table */}
      <TimesheetHistoryTable employeeId={activeEmployee._id} />
    </div>
  );
};
