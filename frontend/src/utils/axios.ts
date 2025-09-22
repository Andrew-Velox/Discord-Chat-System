import axios from 'axios';

// Configure axios defaults for all requests
axios.defaults.withCredentials = true;

// Request interceptor to ensure credentials are always sent
axios.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    console.log('🔍 Request interceptor:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors globally
axios.interceptors.response.use(
  (response) => {
    console.log('✅ Response interceptor:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.log('❌ Response error interceptor:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    // Log auth errors but don't automatically logout
    if (error.response?.status === 401) {
      console.log('401 error intercepted:', error.config?.url);
    }
    if (error.response?.status === 403) {
      console.log('403 error intercepted:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default axios;