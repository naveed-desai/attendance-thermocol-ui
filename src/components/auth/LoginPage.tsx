import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.ts';
import { login, clearAuthError } from '../../store/slices/authSlice.ts';
import {
  Clock,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  Shield,
  User,
  KeyRound,
} from 'lucide-react';
import { envConfig } from '../../config/envConfig.ts';
import { Footer } from '../Footer.tsx';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handlePhoneChange = (val: string) => {
    // Only allow numeric digits and limit to 10 digits
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (phoneError) setPhoneError(null);
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setPhoneError('Please enter your phone number');
      return;
    }
    if (cleanPhone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    if (!password) return;
    setPhoneError(null);
    dispatch(login({ phone: cleanPhone, password }));
  };

  const fillAdminCredentials = () => {
    setPhone('9008888569');
    setPassword('naveed123');
    setPhoneError(null);
    dispatch(clearAuthError());
  };

  const fillEmployeeDefaultPassword = () => {
    setPassword('test123');
    dispatch(clearAuthError());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12 w-full">
        <div className="max-w-md w-full space-y-6">
          {/* Branding & Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 items-center justify-center text-white shadow-md shadow-indigo-200">
              <Clock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              WorkTime & Salary
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Attendance & Payroll Management Portal
            </p>
          </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered phone number and password to access your portal.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2.5 text-rose-700 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Phone Number
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
                  placeholder="10-digit number (e.g. 9876543210)"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  autoComplete="tel"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {phoneError && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) dispatch(clearAuthError());
                  }}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick-fill Helper Badges for Demonstration & Convenience (Controlled via envConfig) */}
          {envConfig.ENABLE_QUICK_LOGIN && (
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Default Credentials Helper
              </span>

              {/* Admin Preset */}
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold text-purple-900 block">Admin Account</span>
                    <span className="text-purple-600 text-[11px]">
                      9008888569 • naveed123
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              {/* Employee Preset */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">Employee Accounts</span>
                    <span className="text-slate-500 text-[11px]">
                      Use your phone • Default password: test123
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fillEmployeeDefaultPassword}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                  title="Fill 'test123' as password"
                >
                  <KeyRound className="w-3 h-3 text-slate-400" />
                  <span>Fill PW</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Footer with developer details */}
    <Footer className="w-full bg-white/70 backdrop-blur-xs" />
  </div>
);
};
