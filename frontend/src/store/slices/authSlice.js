import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAPI from '../../services/authAPI';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
  registrationStep: 1,
  loginAttempts: 0,
  lastLogin: null,
};

// Async thunks for authentication
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Registration failed'
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.user;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('token');
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to get user data'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      return response.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Profile update failed'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword);
      return response.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Password change failed'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('token');
      return null;
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    setRegistrationStep: (state, action) => {
      state.registrationStep = action.payload;
    },
    resetRegistrationStep: (state) => {
      state.registrationStep = 1;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
    },
    updateUserPreferences: (state, action) => {
      if (state.user) {
        state.user.preferences = { ...state.user.preferences, ...action.payload };
      }
    },
    updateUserActivity: (state, action) => {
      if (state.user) {
        state.user.activity = { ...state.user.activity, ...action.payload };
      }
    },
    addUserAchievement: (state, action) => {
      if (state.user && state.user.activity) {
        state.user.activity.achievements = [
          ...(state.user.activity.achievements || []),
          action.payload
        ];
      }
    },
    updateUserPoints: (state, action) => {
      if (state.user && state.user.activity) {
        state.user.activity.points = action.payload;
      }
    },
    updateStreak: (state, action) => {
      if (state.user && state.user.activity) {
        state.user.activity.streakDays = action.payload;
        state.user.activity.lastStreakDate = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLogin = new Date().toISOString();
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.loginAttempts += 1;
      })
      
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.registrationStep = 1;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      
      // Update profile cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Change password cases
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.registrationStep = 1;
        state.loginAttempts = 0;
      });
  },
});

// Action creators
export const {
  clearError,
  clearAuth,
  setRegistrationStep,
  resetRegistrationStep,
  incrementLoginAttempts,
  resetLoginAttempts,
  updateUserPreferences,
  updateUserActivity,
  addUserAchievement,
  updateUserPoints,
  updateStreak,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserPreferences = (state) => state.auth.user?.preferences;
export const selectUserActivity = (state) => state.auth.user?.activity;
export const selectUserPoints = (state) => state.auth.user?.activity?.points || 0;
export const selectUserStreak = (state) => state.auth.user?.activity?.streakDays || 0;
export const selectUserAchievements = (state) => state.auth.user?.activity?.achievements || [];

export default authSlice.reducer;

