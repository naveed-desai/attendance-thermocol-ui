import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/client.ts';
import type { Attendance, AttendanceStatus } from '../../types/index.ts';
import { fetchEmployees } from './employeesSlice.ts';

interface AttendanceState {
  records: Attendance[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  filters: {
    employeeId?: string;
    status?: AttendanceStatus;
    startDate?: string;
    endDate?: string;
  };
}

const initialState: AttendanceState = {
  records: [],
  loading: false,
  submitting: false,
  error: null,
  filters: {},
};

export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (
    filters: {
      employeeId?: string;
      status?: AttendanceStatus;
      startDate?: string;
      endDate?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      return await api.attendance.list(filters);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to fetch attendance');
    }
  },
);

export const createAttendance = createAsyncThunk(
  'attendance/createAttendance',
  async (
    data: {
      employeeId: string;
      date: string;
      startTime: string;
      endTime?: string;
      dailyRate8h?: number;
      notes?: string;
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const created = await api.attendance.create(data);
      dispatch(fetchAttendance({ employeeId: data.employeeId }));
      dispatch(fetchEmployees(false));
      return created;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to log attendance');
    }
  },
);

export const checkoutAttendance = createAsyncThunk(
  'attendance/checkoutAttendance',
  async (
    data: {
      id: string;
      endTime: string;
      employeeId?: string;
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const updated = await api.attendance.checkout(data.id, data.endTime);
      if (data.employeeId) {
        dispatch(fetchAttendance({ employeeId: data.employeeId }));
      }
      dispatch(fetchEmployees(false));
      return updated;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to complete checkout');
    }
  },
);

export const updateAttendanceStatus = createAsyncThunk(
  'attendance/updateAttendanceStatus',
  async (
    data: {
      id: string;
      status: AttendanceStatus;
      rejectionReason?: string;
      approvedBy?: string;
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const updated = await api.attendance.updateStatus(data.id, {
        status: data.status,
        rejectionReason: data.rejectionReason,
        approvedBy: data.approvedBy,
      });
      dispatch(fetchEmployees(false));
      return updated;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to update attendance status');
    }
  },
);

export const deleteAttendance = createAsyncThunk(
  'attendance/deleteAttendance',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      await api.attendance.delete(id);
      dispatch(fetchEmployees(false));
      return id;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to delete attendance');
    }
  },
);

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<{
        employeeId?: string;
        status?: AttendanceStatus;
        startDate?: string;
        endDate?: string;
      }>,
    ) => {
      state.filters = action.payload;
    },
    clearAttendanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAttendance
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createAttendance
      .addCase(createAttendance.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createAttendance.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // checkoutAttendance
      .addCase(checkoutAttendance.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(checkoutAttendance.fulfilled, (state, action) => {
        state.submitting = false;
        const idx = state.records.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) {
          state.records[idx] = action.payload;
        }
      })
      .addCase(checkoutAttendance.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // updateAttendanceStatus
      .addCase(updateAttendanceStatus.fulfilled, (state, action) => {
        const idx = state.records.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) {
          state.records[idx] = action.payload;
        }
      })
      // deleteAttendance
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.records = state.records.filter((r) => r._id !== action.payload);
      });
  },
});

export const { setFilters, clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
