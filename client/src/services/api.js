import axios from 'axios';

// Environment-based API URL configuration
const getApiUrl = () => {
  // Use environment variable if available
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback based on current environment
  if (process.env.NODE_ENV === 'production') {
    // This should be set in your deployment environment
    return 'https://your-backend-app.onrender.com/api';
  }
  
  // Development fallback
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

console.log('🌐 API URL configured:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout for production
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials for CORS
  withCredentials: false
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
