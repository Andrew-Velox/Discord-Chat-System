import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api';
import { AUTH_TOKEN_KEY, USER_DATA_KEY } from '../config';
import { AuthService, User, LoginResponse } from '../types';

const AuthContext = createContext<AuthService | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.post<LoginResponse>('/api/auth/login/', {
        username,
        password,
      });

      const { token, user: userData } = response.data;
      
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      
      setUser(userData);
      setIsLoggedIn(true);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string, 
    password: string, 
    firstName = '', 
    lastName = ''
  ): Promise<boolean> => {
    try {
      setLoading(true);
      await api.post('/api/auth/register/', {
        username,
        password,
        confirm_password: password,
        first_name: firstName,
        last_name: lastName,
      });
      
      return await login(username, password);
    } catch (error: any) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.post('/api/auth/logout/').catch(() => {});
    
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    
    setUser(null);
    setIsLoggedIn(false);
  };

  const checkAuth = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const userData = localStorage.getItem(USER_DATA_KEY);
      
      if (!token || !userData) {
        setIsLoggedIn(false);
        return false;
      }

      await api.get('/api/auth/verify/');
      
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      setIsLoggedIn(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthService = {
    isLoggedIn,
    loading,
    user,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthService => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};