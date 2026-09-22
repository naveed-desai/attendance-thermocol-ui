import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Role, AuthUser } from '../../types/index.ts';
import { api } from '../../api/client.ts';

const STORAGE_KEY = 'attendance_current_user';

function getInitialUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

interface AuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  currentRole: Role;
  activeEmployeeId: string | null;
  loading: boolean;
  error: string | null;
}

const initialUser = getInitialUser();

const initialState: AuthState = {
  currentUser: initialUser,
  isAuthenticated: !!initialUser,
  currentRole: initialUser?.role ?? 'employee',
  activeEmployeeId: initialUser?.role === 'employee' ? initialUser._id : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk<
  AuthUser,
  { phone: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await api.auth.login(credentials);
    if (!data.success || !data.user) {
      return rejectWithValue('Login failed. Please check your credentials.');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    return data.user;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid credentials';
    return rejectWithValue(message);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<Role>) => {
      // Only admin users can switch portal views
      if (state.currentUser?.role === 'admin') {
        state.currentRole = action.payload;
      }
    },
    setActiveEmployeeId: (state, action: PayloadAction<string | null>) => {
      // Employees are permanently bound to their own user record
      if (state.currentUser?.role === 'employee') {
        state.activeEmployeeId = state.currentUser._id;
      } else {
        state.activeEmployeeId = action.payload;
      }
    },
    logout: (state) => {
      localStorage.removeItem(STORAGE_KEY);
      state.currentUser = null;
      state.isAuthenticated = false;
      state.currentRole = 'employee';
      state.activeEmployeeId = null;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.currentRole = action.payload.role;
        state.activeEmployeeId = action.payload.role === 'employee' ? action.payload._id : null;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to log in';
      });
  },
});

export const { setRole, setActiveEmployeeId, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

