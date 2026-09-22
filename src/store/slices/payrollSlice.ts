import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/client.ts';
import type { Payout, PayrollSummary, PaymentType } from '../../types/index.ts';
import { fetchEmployees } from './employeesSlice.ts';
import { fetchAttendance } from './attendanceSlice.ts';

interface PayrollState {
  summary: PayrollSummary | null;
  payouts: Payout[];
  loading: boolean;
  settling: boolean;
  error: string | null;
}

const initialState: PayrollState = {
  summary: null,
  payouts: [],
  loading: false,
  settling: false,
  error: null,
};

export const fetchPayrollSummary = createAsyncThunk(
  'payroll/fetchPayrollSummary',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      return await api.payroll.getSummary(employeeId);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to fetch payroll summary');
    }
  },
);

export const fetchAllPayouts = createAsyncThunk(
  'payroll/fetchAllPayouts',
  async (employeeId: string | undefined, { rejectWithValue }) => {
    try {
      return await api.payroll.getPayouts(employeeId);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to fetch payouts');
    }
  },
);

export const settlePayroll = createAsyncThunk(
  'payroll/settlePayroll',
  async (
    data: {
      employeeId: string;
      amountPaid: number;
      paymentType: PaymentType;
      paymentMethod?: string;
      note?: string;
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const payout = await api.payroll.settle(data);
      dispatch(fetchPayrollSummary(data.employeeId));
      dispatch(fetchEmployees(false));
      dispatch(fetchAttendance({ employeeId: data.employeeId }));
      return payout;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to process settlement');
    }
  },
);

export const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearPayrollSummary: (state) => {
      state.summary = null;
    },
    clearPayrollError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPayrollSummary
      .addCase(fetchPayrollSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollSummary.fulfilled, (state, action: PayloadAction<PayrollSummary>) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchPayrollSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchAllPayouts
      .addCase(fetchAllPayouts.fulfilled, (state, action: PayloadAction<Payout[]>) => {
        state.payouts = action.payload;
      })
      // settlePayroll
      .addCase(settlePayroll.pending, (state) => {
        state.settling = true;
        state.error = null;
      })
      .addCase(settlePayroll.fulfilled, (state, action) => {
        state.settling = false;
        state.payouts.unshift(action.payload);
      })
      .addCase(settlePayroll.rejected, (state, action) => {
        state.settling = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPayrollSummary, clearPayrollError } = payrollSlice.actions;
export default payrollSlice.reducer;
