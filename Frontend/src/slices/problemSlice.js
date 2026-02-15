// store/slices/problemsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../Utils/axiosClient';


export const fetchProblems = createAsyncThunk(
  'problems/fetchProblems',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem');
      return data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const fetchSolvedProblems = createAsyncThunk(
  'problems/fetchSolvedProblems',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/problem/problemSolvedByUser');
      const solvedArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.problems)
          ? data.problems
          : Array.isArray(data?.result)
            ? data.result
            : [];
      return solvedArray;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

const problemsSlice = createSlice({
  name: 'problems',
  initialState: {
    problems: [],
    solvedProblems: [],
    filters: {
      difficulty: 'all',
      tag: 'all',
      status: 'all'
    },
    loading: false,
    error: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearProblems: (state) => {
      state.problems = [];
      state.solvedProblems = [];
      state.filters = {
        difficulty: 'all',
        tag: 'all',
        status: 'all'
      };
    },
    updateProblems: (state, action) => {
      state.problems = action.payload;
    },
    updateSolvedProblems: (state, action) => {
      state.solvedProblems = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Problems
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.problems = action.payload;
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch problems';
      })
      // Fetch Solved Problems
      .addCase(fetchSolvedProblems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSolvedProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.solvedProblems = action.payload;
      })
      .addCase(fetchSolvedProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch solved problems';
      });
  }
});

export const { setFilters, clearProblems, updateProblems, updateSolvedProblems } = problemsSlice.actions;
export default problemsSlice.reducer;