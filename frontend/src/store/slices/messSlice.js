import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  menu: {},
  complaints: [],
  announcements: [],
  loading: false,
  error: null,
  hostelInfo: {
    roomNumber: '',
    floor: null,
    hostelName: '',
    roommates: [],
  },
  preferences: {
    dietaryRestrictions: [],
    allergies: [],
    mealNotifications: true,
  },
};

const messSlice = createSlice({
  name: 'mess',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setMenu: (state, action) => {
      state.menu = action.payload;
    },
    setComplaints: (state, action) => {
      state.complaints = action.payload;
    },
    addComplaint: (state, action) => {
      state.complaints.unshift(action.payload);
    },
    updateComplaint: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.complaints.findIndex(complaint => complaint.id === id);
      if (index !== -1) {
        state.complaints[index] = { ...state.complaints[index], ...updates };
      }
    },
    setAnnouncements: (state, action) => {
      state.announcements = action.payload;
    },
    addAnnouncement: (state, action) => {
      state.announcements.unshift(action.payload);
    },
    setHostelInfo: (state, action) => {
      state.hostelInfo = { ...state.hostelInfo, ...action.payload };
    },
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setMenu,
  setComplaints,
  addComplaint,
  updateComplaint,
  setAnnouncements,
  addAnnouncement,
  setHostelInfo,
  setPreferences,
  clearError,
} = messSlice.actions;

export const selectMenu = (state) => state.mess.menu;
export const selectComplaints = (state) => state.mess.complaints;
export const selectAnnouncements = (state) => state.mess.announcements;
export const selectHostelInfo = (state) => state.mess.hostelInfo;
export const selectPreferences = (state) => state.mess.preferences;
export const selectMessLoading = (state) => state.mess.loading;
export const selectMessError = (state) => state.mess.error;

export default messSlice.reducer;
