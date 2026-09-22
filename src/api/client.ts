import type {
  Attendance,
  AttendanceStatus,
  AuthUser,
  DailyRateOverride,
  Employee,
  Payout,
  PayrollSummary,
  PaymentType,
  ResolvedRate,
} from '../types/index.ts';
import { envConfig } from '../config/envConfig.ts';

const BASE_URL = envConfig.API_BASE_URL;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await res.json();
      if (errorData.message) {
        errorMsg = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message;
      }
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  rates: {
    resolve: async (date?: string, customRate?: number): Promise<ResolvedRate> => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (customRate) params.append('customRate', customRate.toString());
      const res = await fetch(`${BASE_URL}/rates/resolve?${params.toString()}`);
      return handleResponse<ResolvedRate>(res);
    },
    getOverrides: async (): Promise<DailyRateOverride[]> => {
      const res = await fetch(`${BASE_URL}/rates/overrides`);
      return handleResponse<DailyRateOverride[]>(res);
    },
    setOverride: async (data: {
      date: string;
      rate8h: number;
      reason?: string;
    }): Promise<DailyRateOverride> => {
      const res = await fetch(`${BASE_URL}/rates/overrides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<DailyRateOverride>(res);
    },
    deleteOverride: async (date: string): Promise<{ success: boolean; date: string }> => {
      const res = await fetch(`${BASE_URL}/rates/overrides/${date}`, {
        method: 'DELETE',
      });
      return handleResponse<{ success: boolean; date: string }>(res);
    },
  },

  employees: {
    list: async (includeInactive = false): Promise<Employee[]> => {
      const res = await fetch(
        `${BASE_URL}/employees?includeInactive=${includeInactive}`,
      );
      return handleResponse<Employee[]>(res);
    },
    get: async (id: string): Promise<Employee> => {
      const res = await fetch(`${BASE_URL}/employees/${id}`);
      return handleResponse<Employee>(res);
    },
    create: async (data: {
      name: string;
      phone: string;
      email?: string;
      role?: string;
      customDailyRate?: number;
      designation?: string;
    }): Promise<Employee> => {
      const res = await fetch(`${BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<Employee>(res);
    },
    update: async (
      id: string,
      data: Partial<Employee>,
    ): Promise<Employee> => {
      const res = await fetch(`${BASE_URL}/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<Employee>(res);
    },
    delete: async (id: string): Promise<{ success: boolean; id: string }> => {
      const res = await fetch(`${BASE_URL}/employees/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<{ success: boolean; id: string }>(res);
    },
  },

  attendance: {
    list: async (filters: {
      employeeId?: string;
      status?: AttendanceStatus;
      paymentStatus?: string;
      startDate?: string;
      endDate?: string;
    } = {}): Promise<Attendance[]> => {
      const params = new URLSearchParams();
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`${BASE_URL}/attendance?${params.toString()}`);
      return handleResponse<Attendance[]>(res);
    },
    get: async (id: string): Promise<Attendance> => {
      const res = await fetch(`${BASE_URL}/attendance/${id}`);
      return handleResponse<Attendance>(res);
    },
    create: async (data: {
      employeeId: string;
      date: string;
      startTime: string;
      endTime?: string;
      dailyRate8h?: number;
      notes?: string;
    }): Promise<Attendance> => {
      const res = await fetch(`${BASE_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<Attendance>(res);
    },
    checkout: async (id: string, endTime: string): Promise<Attendance> => {
      const res = await fetch(`${BASE_URL}/attendance/${id}/checkout`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endTime }),
      });
      return handleResponse<Attendance>(res);
    },
    updateStatus: async (
      id: string,
      data: {
        status: AttendanceStatus;
        rejectionReason?: string;
        approvedBy?: string;
      },
    ): Promise<Attendance> => {
      const res = await fetch(`${BASE_URL}/attendance/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<Attendance>(res);
    },
    delete: async (id: string): Promise<{ success: boolean; id: string }> => {
      const res = await fetch(`${BASE_URL}/attendance/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<{ success: boolean; id: string }>(res);
    },
  },

  payroll: {
    getSummary: async (employeeId: string): Promise<PayrollSummary> => {
      const res = await fetch(`${BASE_URL}/payroll/summary/${employeeId}`);
      return handleResponse<PayrollSummary>(res);
    },
    getPayouts: async (employeeId?: string): Promise<Payout[]> => {
      const params = new URLSearchParams();
      if (employeeId) params.append('employeeId', employeeId);
      const res = await fetch(`${BASE_URL}/payroll/payouts?${params.toString()}`);
      return handleResponse<Payout[]>(res);
    },
    settle: async (data: {
      employeeId: string;
      amountPaid: number;
      paymentType: PaymentType;
      paymentMethod?: string;
      note?: string;
    }): Promise<Payout> => {
      const res = await fetch(`${BASE_URL}/payroll/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<Payout>(res);
    },
  },

  auth: {
    login: async (credentials: {
      phone: string;
      password: string;
    }): Promise<{ success: boolean; user: AuthUser }> => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return handleResponse<{ success: boolean; user: AuthUser }>(res);
    },
  },
};
