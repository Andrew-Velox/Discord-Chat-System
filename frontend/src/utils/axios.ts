import axios from 'axios';

// Configure axios defaults for all requests
axios.defaults.withCredentials = true;

// Request interceptor to ensure credentials are always sent
axios.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
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
    // Silently handle auth errors - don't log them
    return Promise.reject(error);
  }
);

export default axios;