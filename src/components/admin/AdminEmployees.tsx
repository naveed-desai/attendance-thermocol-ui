import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import {
  createEmployee,
  updateEmployee,
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
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect.tsx';
import { Pagination } from '../common/Pagination.tsx';

interface AdminEmployeesProps {
  onSelectForPayroll?: (employeeId: string) => void;
}

export const AdminEmployees: React.FC<AdminEmployeesProps> = ({
  onSelectForPayroll,
}) => {
  const dispatch = useAppDispatch();
  const { list: employees, loading } = useAppSelector((state) => state.employees);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [designation, setDesignation] = useState('');
  const [customDailyRate, setCustomDailyRate] = useState<string>('240');

  const totalPages = Math.max(1, Math.ceil(employees.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedEmployees = employees.slice(startIndex, startIndex + pageSize);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Change Password Modal state
  const [passwordModalEmp, setPasswordModalEmp] = useState<{
    id: string;
    name: string;
    phone: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleOpenModal = () => {
    setName('');
    setEmail('');
    setRole('employee');
    setPhone('');
    setPassword('');
    setShowPassword(false);
    setDesignation('');
    setCustomDailyRate('240');
    setFormError(null);
    setShowModal(true);
  };

  const handlePhoneChange = (val: string) => {
    // Only allow numeric digits and limit to 10 digits
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (formError) setFormError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setFormError('Please enter a phone number for the employee.');
      return;
    }

    if (cleanPhone.length !== 10 || !/^[0-9]{10}$/.test(cleanPhone)) {
      setFormError('Phone number must be exactly 10 digits (e.g. 9876543210).');
      return;
    }

    if (!password.trim()) {
      setFormError('Please enter a login password for the employee.');
      return;
    }

    if (password.trim().length < 4) {
      setFormError('Password must be at least 4 characters long.');
      return;
    }

    if (!customDailyRate.trim() || Number(customDailyRate) <= 0) {
      setFormError('Please enter a valid daily rate for the employee (greater than 0).');
      return;
    }

    setSubmitting(true);

    try {
      await dispatch(
        createEmployee({
          name: name.trim(),
          phone: phone.trim(),
          password: password.trim(),
          email: email.trim() ? email.trim().toLowerCase() : undefined,
          role,
          designation: designation.trim() || undefined,
          customDailyRate: Number(customDailyRate),
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

  const handleOpenPasswordModal = (emp: { _id: string; name: string; phone: string }) => {
    setPasswordModalEmp({ id: emp._id, name: emp.name, phone: emp.phone });
    setNewPassword('');
    setShowNewPassword(false);
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalEmp) return;
    if (!newPassword.trim()) {
      setPasswordError('Please enter a new password');
      return;
    }
    if (newPassword.trim().length < 4) {
      setPasswordError('Password must be at least 4 characters long');
      return;
    }

    setPasswordError(null);
    setPasswordSubmitting(true);
    try {
      await dispatch(
        updateEmployee({
          id: passwordModalEmp.id,
          data: { password: newPassword.trim() },
        }),
      ).unwrap();
      setPasswordSuccess('Password updated successfully!');
      setTimeout(() => {
        setPasswordModalEmp(null);
      }, 1000);
    } catch (err: unknown) {
      setPasswordError(
        typeof err === 'string'
          ? err
          : (err as Error)?.message || 'Failed to update password',
      );
    } finally {
      setPasswordSubmitting(false);
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
                paginatedEmployees.map((emp) => (
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
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      ₹{emp.customDailyRate ?? 240}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        / 8h
                      </span>
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
                          onClick={() => handleOpenPasswordModal(emp)}
                          title="Change / Reset Password"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(emp._id, emp.name)}
                          title="Delete Employee"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

        {employees.length > 0 && (
          <Pagination
            currentPage={safeCurrentPage}
            totalItems={employees.length}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Phone Number *
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {phone.length}/10 digits
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
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

              {/* Login Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Login Password *
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setPassword('test123')}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                    >
                      Use "test123"
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const randomNum = Math.floor(1000 + Math.random() * 9000);
                        setPassword(`emp${randomNum}`);
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                    >
                      Auto-generate
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password for employee login"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Employee will sign in using their phone number and this password.
                </p>
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

              {/* Daily Rate / 8h Wage */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Rate / 8h Wage (₹) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="e.g. 240, 250, 300"
                    min="1"
                    value={customDailyRate}
                    onChange={(e) => setCustomDailyRate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Baseline 8-hour wage for all weekdays and weekends (Monday through Sunday).
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

      {/* Change Password Modal */}
      {passwordModalEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Change Password</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {passwordModalEmp.name} • {passwordModalEmp.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalEmp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-700 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    New Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomNum = Math.floor(1000 + Math.random() * 9000);
                      setNewPassword(`emp${randomNum}`);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                  >
                    Auto-generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min 4 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  The employee will immediately use this new password to sign into their portal.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalEmp(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{passwordSubmitting ? 'Updating...' : 'Save Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
