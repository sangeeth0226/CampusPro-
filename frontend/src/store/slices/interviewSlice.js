import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  questions: [],
  currentSession: null,
  sessions: [],
  userProgress: {
    totalSessions: 0,
    averageScore: 0,
    strongCategories: [],
    weakCategories: [],
    recentSessions: [],
  },
  loading: false,
  error: null,
  filters: {
    category: 'all',
    difficulty: 'all',
    type: 'all',
  },
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setQuestions: (state, action) => {
      state.questions = action.payload;
    },
    addQuestion: (state, action) => {
      state.questions.push(action.payload);
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    setSessions: (state, action) => {
      state.sessions = action.payload;
    },
    addSession: (state, action) => {
      state.sessions.push(action.payload);
    },
    updateSession: (state, action) => {
      const { id, updates } = action.payload;
      const sessionIndex = state.sessions.findIndex(session => session.id === id);
      if (sessionIndex !== -1) {
        state.sessions[sessionIndex] = { ...state.sessions[sessionIndex], ...updates };
      }
      if (state.currentSession && state.currentSession.id === id) {
        state.currentSession = { ...state.currentSession, ...updates };
      }
    },
    addAnswerToSession: (state, action) => {
      const { sessionId, answer } = action.payload;
      if (state.currentSession && state.currentSession.id === sessionId) {
        state.currentSession.answers = state.currentSession.answers || [];
        state.currentSession.answers.push(answer);
      }
    },
    setUserProgress: (state, action) => {
      state.userProgress = action.payload;
    },
    updateUserProgress: (state, action) => {
      state.userProgress = { ...state.userProgress, ...action.payload };
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setQuestions,
  addQuestion,
  setCurrentSession,
  setSessions,
  addSession,
  updateSession,
  addAnswerToSession,
  setUserProgress,
  updateUserProgress,
  setFilters,
  clearError,
  clearCurrentSession,
} = interviewSlice.actions;

export const selectQuestions = (state) => state.interview.questions;
export const selectCurrentSession = (state) => state.interview.currentSession;
export const selectSessions = (state) => state.interview.sessions;
export const selectUserProgress = (state) => state.interview.userProgress;
export const selectInterviewLoading = (state) => state.interview.loading;
export const selectInterviewError = (state) => state.interview.error;
export const selectInterviewFilters = (state) => state.interview.filters;

export default interviewSlice.reducer;
