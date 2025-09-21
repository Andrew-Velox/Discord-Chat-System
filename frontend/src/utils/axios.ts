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
    // Log auth errors but don't automatically logout
    if (error.response?.status === 401) {
      console.log('401 error intercepted:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default axios;