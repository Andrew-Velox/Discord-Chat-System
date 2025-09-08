
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
    // Check authentication status - simplified to avoid verification loops
    const checkAuthStatus = async () => {
        setIsLoading(true);
        
        // Check localStorage for authentication state
        const localStorageAuth = localStorage.getItem("isLoggedIn") === "true";
        const storedUserId = localStorage.getItem("user_id");
        
        // If we have no local storage indication of being logged in, user is not authenticated
        if (!localStorageAuth || !storedUserId) {
            setIsLoggedIn(false);
            setIsLoading(false);
            return false;
        }
        
        // For WebSocket connections, we need to ensure the JWT cookie is still valid
        // Let's do a lightweight check to make sure the backend can authenticate us
        try {
            await axios.get(`${BASE_URL}/api/auth/verify/`, { withCredentials: true });
            console.log("JWT cookie verification successful");
            setIsLoggedIn(true);
            setIsLoading(false);
            return true;
        } catch (error: any) {
            // If cookie verification fails, try to refresh
            if (error.response?.status === 401) {
                console.log("JWT cookie expired, attempting refresh...");
                try {
                    await axios.post(`${BASE_URL}/api/token/refresh/`, {}, { withCredentials: true });
                    console.log("Token refresh successful");
                    setIsLoggedIn(true);
                    setIsLoading(false);
                    return true;
                } catch (refreshError) {
                    console.log("Token refresh failed, user needs to login again");
                    localStorage.setItem("isLoggedIn", "false");
                    localStorage.removeItem("user_id");
                    localStorage.removeItem("username");
                    setIsLoggedIn(false);
                    setIsLoading(false);
                    return false;
                }
            }
            
            // For other errors, trust localStorage but log the issue
            console.log("Auth verification had issues, but trusting localStorage:", error.response?.status);
            setIsLoggedIn(localStorageAuth);
            setIsLoading(false);
            return localStorageAuth;
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
                `${BASE_URL}/api/token/`,
                { username, password },
                { withCredentials: true }
            );
            
            // Store authentication state immediately
            setIsLoggedIn(true);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("user_id", response.data.user_id);
            localStorage.setItem("username", username); // Store the username from login
            
            console.log("Login successful, user authenticated");
            return 200;
        } catch (err: any) {
            console.log("Login failed:", err.response?.status);
            setIsLoggedIn(false);
            localStorage.setItem("isLoggedIn", "false");
            localStorage.removeItem("user_id");
            localStorage.removeItem("username");
            return err.response?.status || 500;
        } finally {
            setIsLoading(false);
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