import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clubs: [],
  currentClub: null,
  userClubs: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    search: '',
    sortBy: 'members',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalClubs: 0,
    hasNext: false,
    hasPrev: false,
  },
};

const clubSlice = createSlice({
  name: 'clubs',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setClubs: (state, action) => {
      state.clubs = action.payload;
    },
    setCurrentClub: (state, action) => {
      state.currentClub = action.payload;
    },
    setUserClubs: (state, action) => {
      state.userClubs = action.payload;
    },
    addClub: (state, action) => {
      state.clubs.push(action.payload);
    },
    updateClub: (state, action) => {
      const { id, updates } = action.payload;
      const clubIndex = state.clubs.findIndex(club => club._id === id);
      if (clubIndex !== -1) {
        state.clubs[clubIndex] = { ...state.clubs[clubIndex], ...updates };
      }
      if (state.currentClub && state.currentClub._id === id) {
        state.currentClub = { ...state.currentClub, ...updates };
      }
    },
    joinClub: (state, action) => {
      const clubId = action.payload;
      const clubIndex = state.clubs.findIndex(club => club._id === clubId);
      if (clubIndex !== -1) {
        state.clubs[clubIndex].memberCount += 1;
      }
    },
    leaveClub: (state, action) => {
      const clubId = action.payload;
      const clubIndex = state.clubs.findIndex(club => club._id === clubId);
      if (clubIndex !== -1) {
        state.clubs[clubIndex].memberCount -= 1;
      }
      state.userClubs = state.userClubs.filter(club => club._id !== clubId);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentClub: (state) => {
      state.currentClub = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setClubs,
  setCurrentClub,
  setUserClubs,
  addClub,
  updateClub,
  joinClub,
  leaveClub,
  setFilters,
  setPagination,
  clearError,
  clearCurrentClub,
} = clubSlice.actions;

export const selectClubs = (state) => state.clubs.clubs;
export const selectCurrentClub = (state) => state.clubs.currentClub;
export const selectUserClubs = (state) => state.clubs.userClubs;
export const selectClubsLoading = (state) => state.clubs.loading;
export const selectClubsError = (state) => state.clubs.error;
export const selectClubsFilters = (state) => state.clubs.filters;
export const selectClubsPagination = (state) => state.clubs.pagination;

export default clubSlice.reducer;
