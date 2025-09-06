
import axios from "axios";
import type { AuthServiceProps } from "../@types/auth-service";
import { useState, useEffect } from "react";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

export function useAuthService(): AuthServiceProps {
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Check authentication status by verifying the cookie with the server
    const checkAuthStatus = async () => {
        setIsLoading(true);
        
        // First check localStorage for quick initial state
        const localStorageAuth = localStorage.getItem("isLoggedIn") === "true";
        
        // If we have no local storage indication of being logged in, don't bother checking server
        if (!localStorageAuth) {
            setIsLoggedIn(false);
            setIsLoading(false);
            return false;
        }
        
        try {
            // Try to verify with the server if the endpoint exists
            const response = await axios.get(
                `${BASE_URL}/api/auth/verify/`,
                { 
                    withCredentials: true,
                    timeout: 5000 // 5 second timeout
                }
            );
            
            // Server confirms authentication
            setIsLoggedIn(true);
            localStorage.setItem("isLoggedIn", "true");
            if (response.data.user_id) {
                localStorage.setItem("user_id", response.data.user_id);
            }
            if (response.data.username) {
                localStorage.setItem("username", response.data.username);
            }
            return true;
        } catch (error: any) {
            console.log("Auth verification error:", error.response?.status);
            
            // If server is unreachable or has issues, trust localStorage temporarily
            if (!error.response || error.response?.status >= 500) {
                console.log("Server error, maintaining login state from localStorage");
                setIsLoggedIn(localStorageAuth);
                return localStorageAuth;
            }
            
            // If unauthorized (401/403), clear authentication
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log("Authentication expired, logging out");
                setIsLoggedIn(false);
                localStorage.setItem("isLoggedIn", "false");
                localStorage.removeItem("user_id");
                localStorage.removeItem("username");
                return false;
            }
            
            // For other errors, trust localStorage but try to refresh token
            console.log("Network or other error, attempting token refresh");
            try {
                await axios.post(`${BASE_URL}/api/token/refresh/`, {}, { withCredentials: true });
                setIsLoggedIn(true);
                return true;
            } catch (refreshError) {
                console.log("Token refresh failed, using localStorage state");
                setIsLoggedIn(localStorageAuth);
                return localStorageAuth;
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Check auth status on component mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/api/token/`,
                { username, password },
                { withCredentials: true }
            );
            
            // Store authentication state
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("user_id", response.data.user_id);
            if (response.data.username) {
                localStorage.setItem("username", response.data.username);
            }
            setIsLoggedIn(true);
            
            console.log("Login successful, user authenticated");
            return 200;
        } catch (err: any) {
            console.log("Login failed:", err.response?.status);
            setIsLoggedIn(false);
            localStorage.setItem("isLoggedIn", "false");
            localStorage.removeItem("user_id");
            localStorage.removeItem("username");
            return err.response?.status || 500;
        }
    };

    const register = async (username: string, password: string) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/api/register/`,
                { username, password },
                { withCredentials: true }
            );
            return response.status;
        } catch (err: any) {
            return err.response?.status || 500;
        }
    };

    const logout = async () => {
        // Clear local storage first
        localStorage.setItem("isLoggedIn", "false");
        localStorage.removeItem("user_id");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        
        // Navigate to login
        navigate("/login");
        
        // Call logout endpoint (don't block on errors)
        try {
            await axios.post(`${BASE_URL}/api/logout/`, {}, { withCredentials: true });
        } catch (error) {
            console.log("Logout endpoint failed, but user is logged out locally");
        }
    };

    const refreshAccessToken = async () => {
        try {
            await axios.post(`${BASE_URL}/api/token/refresh/`, {}, { withCredentials: true });
        } catch (refreshError) {
            logout(); // Auto-logout on refresh failure
            throw refreshError;
        }
    };

    return { login, isLoggedIn, isLoading, logout, refreshAccessToken, register };
}