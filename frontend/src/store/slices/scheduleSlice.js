import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  schedule: null,
  classes: [],
  events: [],
  exams: [],
  studySessions: [],
  loading: false,
  error: null,
  view: 'week', // 'day', 'week', 'month'
  selectedDate: new Date().toISOString().split('T')[0],
  filters: {
    showClasses: true,
    showEvents: true,
    showExams: true,
    showPersonal: true,
  },
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSchedule: (state, action) => {
      state.schedule = action.payload;
      state.classes = action.payload?.classes || [];
      state.events = action.payload?.events || [];
      state.exams = action.payload?.exams || [];
      state.studySessions = action.payload?.studySessions || [];
    },
    addEvent: (state, action) => {
      state.events.push(action.payload);
    },
    updateEvent: (state, action) => {
      const { id, updates } = action.payload;
      const eventIndex = state.events.findIndex(event => event._id === id);
      if (eventIndex !== -1) {
        state.events[eventIndex] = { ...state.events[eventIndex], ...updates };
      }
    },
    deleteEvent: (state, action) => {
      state.events = state.events.filter(event => event._id !== action.payload);
    },
    addClass: (state, action) => {
      state.classes.push(action.payload);
    },
    updateClass: (state, action) => {
      const { id, updates } = action.payload;
      const classIndex = state.classes.findIndex(cls => cls._id === id);
      if (classIndex !== -1) {
        state.classes[classIndex] = { ...state.classes[classIndex], ...updates };
      }
    },
    deleteClass: (state, action) => {
      state.classes = state.classes.filter(cls => cls._id !== action.payload);
    },
    setView: (state, action) => {
      state.view = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setSchedule,
  addEvent,
  updateEvent,
  deleteEvent,
  addClass,
  updateClass,
  deleteClass,
  setView,
  setSelectedDate,
  setFilters,
  clearError,
} = scheduleSlice.actions;

export const selectSchedule = (state) => state.schedule.schedule;
export const selectClasses = (state) => state.schedule.classes;
export const selectEvents = (state) => state.schedule.events;
export const selectExams = (state) => state.schedule.exams;
export const selectScheduleView = (state) => state.schedule.view;
export const selectSelectedDate = (state) => state.schedule.selectedDate;
export const selectScheduleFilters = (state) => state.schedule.filters;
export const selectScheduleLoading = (state) => state.schedule.loading;
export const selectScheduleError = (state) => state.schedule.error;

export default scheduleSlice.reducer;
