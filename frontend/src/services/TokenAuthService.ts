import axios from "../utils/axios";
import type { AuthServiceProps } from "../@types/auth-service";
import { useState, useEffect } from "react";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

export function useTokenAuthService(): AuthServiceProps {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Token-based authentication check (like e-commerce project)
    const checkAuthStatus = async () => {
        setIsLoading(true);
        
        // Quick check: if there's no token in localStorage, don't bother making the request
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setIsLoggedIn(false);
            setIsLoading(false);
            return false;
        }
        
        try {
            // Set token in axios header for verification
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            
            // Try to verify with Django Token auth
            await axios.get(`${BASE_URL}/api/auth/verify/`);
            setIsLoggedIn(true);
            setIsLoading(false);
            return true;
        } catch (error: any) {
            // Token is invalid, remove it
            localStorage.removeItem('auth_token');
            delete axios.defaults.headers.common['Authorization'];
            setIsLoggedIn(false);
            setIsLoading(false);
            return false;
        }
    };

    // Check auth status on component mount and page visibility change
    useEffect(() => {
        checkAuthStatus();
        
        // Re-check auth when page becomes visible (handles refresh/tab switching)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkAuthStatus();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Also check on window focus (handles refresh)
        const handleFocus = () => {
            checkAuthStatus();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/api/auth/login/`,
                { username, password }
            );
            
            // Store the token in localStorage (like e-commerce project)
            const { token, user } = response.data;
            localStorage.setItem('auth_token', token);
            
            // Set token in axios headers for future requests
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            
            // Store user data if needed
            localStorage.setItem('user_data', JSON.stringify(user));
            
            setIsLoggedIn(true);
            return 200;
        } catch (err: any) {
            setIsLoggedIn(false);
            return err.response?.status || 500;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (username: string, password: string) => {
        try {
            // Use simple registration format to match frontend expectations
            const payload = { 
                username, 
                password, 
                confirm_password: password,  // Auto-confirm for simple registration
                first_name: "",
                last_name: ""
            };

            await axios.post(
                `${BASE_URL}/api/auth/register/`,
                payload
            );
            return 201; // Created
        } catch (err: any) {
            return err.response?.status || 500;
        }
    };

    const logout = async () => {
        try {
            // Call Django logout endpoint
            const token = localStorage.getItem('auth_token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Token ${token}`;
                await axios.post(`${BASE_URL}/api/auth/logout/`);
            }
        } catch (error: any) {
            // Silently handle logout errors - user still gets logged out locally
        }
        
        // Clear local storage and axios headers
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        delete axios.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
        
        // Navigate to login
        navigate("/login");
    };

    const refreshAccessToken = async () => {
        // Token auth doesn't need refresh - tokens don't expire by default
        // If you implement token expiration, you can add refresh logic here
        return Promise.resolve();
    };

    return { login, isLoggedIn, isLoading, logout, refreshAccessToken, register };
}