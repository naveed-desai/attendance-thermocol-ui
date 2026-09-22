import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/client.ts';
import type { DailyRateOverride, ResolvedRate } from '../../types/index.ts';

interface RatesState {
  currentResolvedRate: ResolvedRate | null;
  overrides: DailyRateOverride[];
  loading: boolean;
  error: string | null;
}

const initialState: RatesState = {
  currentResolvedRate: null,
  overrides: [],
  loading: false,
  error: null,
};

export const resolveRate = createAsyncThunk(
  'rates/resolveRate',
  async (
    params: { date?: string; customRate?: number } | undefined,
    { rejectWithValue },
  ) => {
    try {
      return await api.rates.resolve(params?.date, params?.customRate);
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to resolve rate');
    }
  },
);

export const fetchOverrides = createAsyncThunk(
  'rates/fetchOverrides',
  async (_, { rejectWithValue }) => {
    try {
      return await api.rates.getOverrides();
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to fetch rate overrides');
    }
  },
);

export const setOverride = createAsyncThunk(
  'rates/setOverride',
  async (
    data: { date: string; rate8h: number; reason?: string },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const saved = await api.rates.setOverride(data);
      dispatch(fetchOverrides());
      return saved;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to set rate override');
    }
  },
);

export const deleteOverride = createAsyncThunk(
  'rates/deleteOverride',
  async (date: string, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.rates.deleteOverride(date);
      dispatch(fetchOverrides());
      return res.date;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message || 'Failed to delete rate override');
    }
  },
);

export const ratesSlice = createSlice({
  name: 'rates',
  initialState,
  reducers: {
    clearRatesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // resolveRate
      .addCase(resolveRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(resolveRate.fulfilled, (state, action: PayloadAction<ResolvedRate>) => {
        state.loading = false;
        state.currentResolvedRate = action.payload;
      })
      .addCase(resolveRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchOverrides
      .addCase(fetchOverrides.fulfilled, (state, action: PayloadAction<DailyRateOverride[]>) => {
        state.overrides = action.payload;
      });
  },
});

export const { clearRatesError } = ratesSlice.actions;
export default ratesSlice.reducer;
