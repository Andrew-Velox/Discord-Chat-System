// Debug utility to help troubleshoot authentication issues
export const authDebug = {
  // Check what's in localStorage
  checkLocalStorage: () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    console.log('=== AUTH DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('Token value:', token ? token.substring(0, 10) + '...' : 'null');
    console.log('User data exists:', !!userData);
    console.log('User data:', userData ? JSON.parse(userData) : 'null');
    return { token, userData };
  },

  // Test a simple API call to see if headers are being sent
  testApiCall: async () => {
    try {
      const response = await fetch('https://discord-chat-system.onrender.com/api/server/select/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Direct fetch test - Status:', response.status);
      const data = await response.json();
      console.log('Direct fetch test - Data:', data);
      return { status: response.status, data };
    } catch (error) {
      console.error('Direct fetch test failed:', error);
      return { error };
    }
  },

  // Clear all auth data
  clearAuth: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    console.log('Auth data cleared');
  }
};

// Make it available globally for browser console debugging
(window as any).authDebug = authDebug;