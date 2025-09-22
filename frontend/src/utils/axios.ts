import axios from 'axios';

// Configure axios defaults for all requests
axios.defaults.withCredentials = false; // Don't need cookies for Token auth

// Request interceptor to add auth token to headers
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage and add to headers
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors globally
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If we get a 401, the token is invalid - clear it
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      delete axios.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export default axios;