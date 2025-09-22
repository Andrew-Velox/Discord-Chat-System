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
      console.log('🔐 Adding auth token to request:', config.url);
    } else {
      console.log('⚠️ No auth token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors globally
axios.interceptors.response.use(
  (response) => {
    console.log('✅ Successful response from:', response.config.url);
    return response;
  },
  (error) => {
    // If we get a 401, the token is invalid - clear it
    if (error.response?.status === 401) {
      console.log('🔑 401 Unauthorized - clearing auth data');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    console.error('❌ Response error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default axios;