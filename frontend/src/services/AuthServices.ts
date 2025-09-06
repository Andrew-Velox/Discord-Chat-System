
import axios from "axios";
import type { AuthServiceProps } from "../@types/auth-service";
import { useState } from "react";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

export function useAuthService(): AuthServiceProps {
    const navigate = useNavigate();

    const getInitialLoggedInValue = () => {
        const loggedIn = localStorage.getItem("isLoggedIn");
        return loggedIn === "true";
    };

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(getInitialLoggedInValue);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/token/`,
                { username, password },
                { withCredentials: true }
            );
            
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("user_id", response.data.user_id);
            setIsLoggedIn(true);
            return 200;
        } catch (err: any) {
            setIsLoggedIn(false);
            localStorage.setItem("isLoggedIn", "false");
            return err.response?.status || 500;
        }
    };

    const register = async (username: string, password: string) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/register/`,
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
            await axios.post(`${BASE_URL}/logout/`, {}, { withCredentials: true });
        } catch (error) {
            console.log("Logout endpoint failed, but user is logged out locally");
        }
    };

    const refreshAccessToken = async () => {
        try {
            await axios.post(`${BASE_URL}/token/refresh/`, {}, { withCredentials: true });
        } catch (refreshError) {
            logout(); // Auto-logout on refresh failure
            throw refreshError;
        }
    };

    return { login, isLoggedIn, logout, refreshAccessToken, register };
}