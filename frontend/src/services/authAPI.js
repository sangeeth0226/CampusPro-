import { apiRequest } from './api';

const authAPI = {
  // Authentication endpoints
  login: async (email, password) => {
    return await apiRequest.post('/auth/login', { email, password });
  },

  register: async (userData) => {
    return await apiRequest.post('/auth/register', userData);
  },

  logout: async () => {
    return await apiRequest.post('/auth/logout');
  },

  getCurrentUser: async () => {
    return await apiRequest.get('/auth/me');
  },

  updateProfile: async (profileData) => {
    return await apiRequest.put('/auth/profile', profileData);
  },

  changePassword: async (currentPassword, newPassword) => {
    return await apiRequest.put('/auth/password', {
      currentPassword,
      newPassword,
    });
  },

  // Password reset (these would need to be implemented on backend)
  forgotPassword: async (email) => {
    return await apiRequest.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    return await apiRequest.post('/auth/reset-password', {
      token,
      newPassword,
    });
  },

  // Email verification
  sendVerificationEmail: async () => {
    return await apiRequest.post('/auth/send-verification');
  },

  verifyEmail: async (token) => {
    return await apiRequest.post('/auth/verify-email', { token });
  },

  // Account management
  deactivateAccount: async (password, reason) => {
    return await apiRequest.delete('/auth/account', {
      data: { password, reason },
    });
  },

  // Social authentication (for future implementation)
  googleAuth: async (googleToken) => {
    return await apiRequest.post('/auth/google', { token: googleToken });
  },

  // Admin endpoints
  getAuthStats: async () => {
    return await apiRequest.get('/auth/stats');
  },

  // Utility functions
  validateToken: async () => {
    try {
      const response = await apiRequest.get('/auth/validate');
      return response.valid;
    } catch (error) {
      return false;
    }
  },

  refreshToken: async () => {
    return await apiRequest.post('/auth/refresh');
  },
};

export default authAPI;

