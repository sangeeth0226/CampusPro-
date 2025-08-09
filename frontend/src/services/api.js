import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching
    config.headers['X-Requested-At'] = Date.now();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    // Return the data directly for successful responses
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('token');
          toast.error('Session expired. Please login again.');
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden
          toast.error(data?.message || 'Access denied');
          break;
          
        case 404:
          // Not found
          toast.error(data?.message || 'Resource not found');
          break;
          
        case 409:
          // Conflict (e.g., duplicate email)
          toast.error(data?.message || 'Conflict error');
          break;
          
        case 422:
          // Validation error
          if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err));
          } else {
            toast.error(data?.message || 'Validation failed');
          }
          break;
          
        case 429:
          // Rate limit exceeded
          toast.error(data?.message || 'Too many requests. Please try again later.');
          break;
          
        case 500:
          // Server error
          toast.error(data?.message || 'Internal server error');
          break;
          
        default:
          // Other errors
          toast.error(data?.message || `Error ${status}: ${error.message}`);
      }
      
      // Return the error response for specific handling
      return Promise.reject(data);
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
      return Promise.reject({ message: 'Network error' });
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
      return Promise.reject({ message: error.message });
    }
  }
);

// Helper functions for common request patterns
export const apiRequest = {
  get: (url, config = {}) => API.get(url, config),
  post: (url, data = {}, config = {}) => API.post(url, data, config),
  put: (url, data = {}, config = {}) => API.put(url, data, config),
  patch: (url, data = {}, config = {}) => API.patch(url, data, config),
  delete: (url, config = {}) => API.delete(url, config),
};

// File upload helper
export const uploadFile = async (url, file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  
  if (onProgress) {
    config.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percentCompleted);
    };
  }
  
  return API.post(url, formData, config);
};

// Download file helper
export const downloadFile = async (url, filename) => {
  try {
    const response = await API.get(url, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Download failed');
    return false;
  }
};

// Batch requests helper
export const batchRequests = async (requests) => {
  try {
    const responses = await Promise.allSettled(requests);
    
    const results = responses.map((response, index) => ({
      index,
      status: response.status,
      data: response.status === 'fulfilled' ? response.value : null,
      error: response.status === 'rejected' ? response.reason : null,
    }));
    
    return results;
  } catch (error) {
    console.error('Batch requests failed:', error);
    throw error;
  }
};

// Retry helper for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

// Cache helper for GET requests
class APICache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
  
  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  delete(key) {
    this.cache.delete(key);
  }
}

export const apiCache = new APICache();

// Cached GET request
export const cachedGet = async (url, config = {}, useCache = true) => {
  const cacheKey = `${url}${JSON.stringify(config)}`;
  
  if (useCache) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  const response = await API.get(url, config);
  
  if (useCache) {
    apiCache.set(cacheKey, response);
  }
  
  return response;
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await API.get('/health');
    return response.status === 'OK';
  } catch (error) {
    return false;
  }
};

// WebSocket connection helper
export const createWebSocketConnection = (token) => {
  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    // Send authentication
    ws.send(JSON.stringify({
      type: 'auth',
      token: token,
    }));
  };
  
  return ws;
};

export default API;

