import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import scheduleSlice from './slices/scheduleSlice';
import clubSlice from './slices/clubSlice';
import interviewSlice from './slices/interviewSlice';
import resumeSlice from './slices/resumeSlice';
import messSlice from './slices/messSlice';
import notificationSlice from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    schedule: scheduleSlice,
    clubs: clubSlice,
    interview: interviewSlice,
    resume: resumeSlice,
    mess: messSlice,
    notifications: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

