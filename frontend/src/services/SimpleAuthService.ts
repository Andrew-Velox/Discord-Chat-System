import axios from "../utils/axios";
import type { AuthServiceProps } from "../@types/auth-service";
import { useState, useEffect } from "react";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

export function useAuthService(): AuthServiceProps {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Simple authentication check using Django sessions
    const checkAuthStatus = async () => {
        setIsLoading(true);
        
        // Quick check: if there's no sessionid cookie, don't bother making the request
        if (!document.cookie.includes('sessionid=')) {
            setIsLoggedIn(false);
            setIsLoading(false);
            return false;
        }
        
        try {
            // Try to verify with Django session auth - no localStorage needed!
            await axios.get(`${BASE_URL}/api/auth/verify/`);
            setIsLoggedIn(true);
            setIsLoading(false);
            return true;
        } catch (error: any) {
            // Silently handle auth failures - this is expected when not logged in
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
            await axios.post(
                `${BASE_URL}/api/auth/login/`,
                { username, password }
            );
            
            // Django sessions handle everything automatically
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
            await axios.post(
                `${BASE_URL}/api/auth/register/`,
                { username, password }
            );
            return 201; // Created
        } catch (err: any) {
            return err.response?.status || 500;
        }
    };

    const logout = async () => {
        // Call Django logout endpoint
        try {
            await axios.post(`${BASE_URL}/api/auth/logout/`);
        } catch (error: any) {
            // Silently handle logout errors - user still gets logged out locally
        }
        
        // Clear local state
        setIsLoggedIn(false);
        
        // Navigate to login
        navigate("/login");
    };

    const refreshAccessToken = async () => {
        // Not needed with Django sessions - sessions auto-refresh on each request
        return Promise.resolve();
    };

    return { login, isLoggedIn, isLoading, logout, refreshAccessToken, register };
}