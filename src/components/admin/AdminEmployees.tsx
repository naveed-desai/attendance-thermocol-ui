import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import {
  createEmployee,
  deleteEmployee,
} from '../../store/slices/employeesSlice.ts';
import {
  UserPlus,
  Trash2,
  Users,
  IndianRupee,
  X,
  Check,
  AlertCircle,
  Briefcase,
  Phone,
  Mail,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect.tsx';

interface AdminEmployeesProps {
  onSelectForPayroll?: (employeeId: string) => void;
}

export const AdminEmployees: React.FC<AdminEmployeesProps> = ({
  onSelectForPayroll,
}) => {
  const dispatch = useAppDispatch();
  const { list: employees, loading } = useAppSelector((state) => state.employees);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [customDailyRate, setCustomDailyRate] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = () => {
    setName('');
    setEmail('');
    setRole('employee');
    setPhone('');
    setDesignation('');
    setCustomDailyRate('');
    setFormError(null);
    setShowModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await dispatch(
        createEmployee({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() ? email.trim().toLowerCase() : undefined,
          role,
          designation: designation.trim() || undefined,
          customDailyRate: customDailyRate ? Number(customDailyRate) : undefined,
        }),
      ).unwrap();

      setShowModal(false);
    } catch (err: unknown) {
      setFormError(
        typeof err === 'string'
          ? err
          : (err as Error)?.message || 'Failed to create employee',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, empName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete employee "${empName}"? This action cannot be undone.`,
      )
    ) {
      await dispatch(deleteEmployee(id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Employee Directory</h2>
          <p className="text-xs text-slate-500">
            Manage employee profiles, roles, and baseline 8-hour wage rates
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">8h Rate</th>
                <th className="py-3 px-4">Total Approved</th>
                <th className="py-3 px-4">Total Paid</th>
                <th className="py-3 px-4">Unpaid Balance</th>
                <th className="py-3 px-4">Pending Shifts</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading employee directory...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No employees registered</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "Add New Employee" above to register your first staff member.
                    </p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Employee Profile */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2">
                        <span className="font-medium text-slate-700">{emp.phone}</span>
                        {emp.email && <span>• {emp.email}</span>}
                        {emp.designation && <span>• {emp.designation}</span>}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          emp.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>

                    {/* Base 8h Rate */}
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {emp.customDailyRate ? (
                        <span className="text-purple-700">
                          ₹{emp.customDailyRate}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            (custom)
                          </span>
                        </span>
                      ) : (
                        <span>
                          ₹240{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            (default)
                          </span>
                        </span>
                      )}
                    </td>

                    {/* Total Approved */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      ₹{emp.totalApprovedSalary?.toFixed(2) ?? '0.00'}
                    </td>

                    {/* Total Paid */}
                    <td className="py-3.5 px-4 text-slate-600">
                      ₹{emp.totalPaidSalary?.toFixed(2) ?? '0.00'}
                    </td>

                    {/* Unpaid Balance */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold text-sm ${
                          (emp.netUnpaidBalance ?? 0) > 0
                            ? 'text-indigo-600'
                            : 'text-slate-400'
                        }`}
                      >
                        ₹{emp.netUnpaidBalance?.toFixed(2) ?? '0.00'}
                      </span>
                    </td>

                    {/* Pending Timesheets */}
                    <td className="py-3.5 px-4">
                      {(emp.pendingCount ?? 0) > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          {emp.pendingCount} pending
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">0</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {onSelectForPayroll && (
                          <button
                            type="button"
                            onClick={() => onSelectForPayroll(emp._id)}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <IndianRupee className="w-3.5 h-3.5" />
                            <span>Settle</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(emp._id, emp.name)}
                          title="Delete Employee"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add New Employee</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Phone & Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="e.g. ramesh@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Role & Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role
                  </label>
                  <CustomSelect
                    value={role}
                    onChange={(val) => setRole(val as 'employee' | 'admin')}
                    options={[
                      { value: 'employee', label: 'Employee' },
                      { value: 'admin', label: 'Admin' },
                    ]}
                    fullWidth={true}
                    className="bg-slate-50 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Operator"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Custom Daily Rate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom 8h Rate (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Default: ₹240 (Sundays ₹250)"
                    min="1"
                    value={customDailyRate}
                    onChange={(e) => setCustomDailyRate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Leave blank for standard default rates (₹240 for Mon–Sat, ₹250 for Sundays)
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : 'Add Employee'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
