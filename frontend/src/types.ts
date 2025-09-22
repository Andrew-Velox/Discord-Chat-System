// Data Types
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface Channel {
  id: number;
  name: string;
  topic: string;
  owner: number;
  server: number;
}

export interface Server {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: number;
  banner: string;
  owner: number;
  owner_name?: string;
  channel_server: Channel[];
}

// Auth Service Interface
export interface AuthService {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

// API Response Types
export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiError {
  detail?: string;
  message?: string;
  non_field_errors?: string[];
}