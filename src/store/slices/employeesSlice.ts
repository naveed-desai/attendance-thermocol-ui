import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/client.ts';
import type { Employee } from '../../types/index.ts';

interface EmployeesState {
  list: Employee[];
  selectedEmployee: Employee | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeesState = {
  list: [],
  selectedEmployee: null,
  loading: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (includeInactive: boolean = false, { rejectWithValue }) => {
    try {
      return await api.employees.list(includeInactive);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to fetch employees');
    }
  },
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (
    data: {
      name: string;
      phone: string;
      password?: string;
      email?: string;
      role?: string;
      customDailyRate?: number;
      designation?: string;
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const created = await api.employees.create(data);
      dispatch(fetchEmployees(false));
      return created;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to create employee');
    }
  },
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async (
    { id, data }: { id: string; data: Partial<Employee> & { password?: string } },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const updated = await api.employees.update(id, data);
      dispatch(fetchEmployees(false));
      return updated;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to update employee');
    }
  },
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.employees.delete(id);
      return id;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to delete employee');
    }
  },
);

export const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
    clearEmployeeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchEmployees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // deleteEmployee
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.list = state.list.filter((emp) => emp._id !== action.payload);
        if (state.selectedEmployee?._id === action.payload) {
          state.selectedEmployee = null;
        }
      });
  },
});

export const { setSelectedEmployee, clearEmployeeError } = employeesSlice.actions;
export default employeesSlice.reducer;
