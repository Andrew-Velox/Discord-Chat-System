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
        
        try {
            // Try to verify with Django session auth - no localStorage needed!
            const response = await axios.get(`${BASE_URL}/api/auth/verify/`);
            console.log("Django session authentication successful", response.data);
            setIsLoggedIn(true);
            setIsLoading(false);
            return true;
        } catch (error: any) {
            console.log("Django session authentication failed:", error.response?.status, error.response?.data);
            setIsLoggedIn(false);
            setIsLoading(false);
            return false;
        }
    };

    // Check auth status on component mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/api/auth/login/`,
                { username, password }
            );
            
            console.log("Login response:", response.data);
            console.log("Response headers:", response.headers);
            
            // Django sessions handle everything automatically
            setIsLoggedIn(true);
            console.log("Login successful with Django sessions");
            return 200;
        } catch (err: any) {
            console.log("Login failed:", err.response?.status);
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
            console.log("Django logout successful");
        } catch (error: any) {
            console.log("Logout endpoint failed:", error.response?.status, error.response?.data);
            console.log("Continuing with local logout...");
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