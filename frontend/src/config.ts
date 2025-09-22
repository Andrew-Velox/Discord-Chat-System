// API Configuration
// Development configuration - using localhost
export const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://discord-chat-system.onrender.com'
  : 'http://127.0.0.1:8000';

export const MEDIA_URL = BASE_URL;

// WebSocket configuration
export const WS_ROOT = process.env.NODE_ENV === 'production'
  ? 'wss://discord-chat-system.onrender.com'
  : 'ws://localhost:8000';

// Auth token storage keys
export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';