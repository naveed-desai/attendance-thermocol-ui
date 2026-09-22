export type Role = 'admin' | 'employee';

export type AttendanceStatus = 'pending' | 'approved' | 'rejected';

export type PaymentStatus = 'unpaid' | 'paid';

export type PaymentType = 'full' | 'partial';

export interface Employee {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  customDailyRate?: number;
  designation?: string;
  isActive: boolean;
  createdAt: string;
  totalApprovedSalary?: number;
  totalPaidSalary?: number;
  netUnpaidBalance?: number;
  pendingCount?: number;
}

export interface AuthUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  customDailyRate?: number;
  designation?: string;
}

export interface DailyRateOverride {
  _id?: string;
  date: string;
  rate8h: number;
  reason?: string;
  setBy?: string;
  createdAt?: string;
}

export interface ResolvedRate {
  date: string;
  dayOfWeek: string;
  isSunday: boolean;
  rate8h: number;
  hourlyRate: number;
  source: 'override' | 'employee_custom' | 'sunday_default' | 'standard_default';
  reason?: string;
}

export interface Attendance {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  } | string;
  date: string;
  dayOfWeek: string;
  isSunday: boolean;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  hoursWorked: number;
  dailyRate8h: number;
  calculatedSalary: number;
  status: AttendanceStatus;
  rejectionReason?: string;
  paymentStatus: PaymentStatus;
  payoutId?: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface Payout {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  amountPaid: number;
  paymentType: PaymentType;
  balanceBefore: number;
  balanceAfter: number;
  paidAt: string;
  paymentMethod: string;
  settledAttendanceIds?: string[];
  note?: string;
}

export interface PayrollSummary {
  employeeId: string;
  employeeName: string;
  employeePhone?: string;
  employeeEmail?: string;
  totalApprovedEarnings: number;
  totalPaid: number;
  netUnpaidBalance: number;
  pendingEarnings: number;
  pendingCount: number;
  approvedUnpaidCount: number;
  lastPaidDate?: string;
  payouts: Payout[];
}
