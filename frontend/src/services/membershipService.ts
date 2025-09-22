import { useState, useCallback, useRef } from "react";
import axios from "../utils/axios"; // Use main axios with Token auth
import { BASE_URL } from "../config";

interface IuseServer {
    joinServer: (serverId: number) => Promise<void>;
    leaveServer: (serverId: number) => Promise<void>;
    isMember: (serverId: number) => Promise<void>;
    isUserMember: boolean;
    error: Error | null;
    isLoading: boolean;
}

const useMembership = (): IuseServer => {
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUserMember, setIsUserMember] = useState(false);
    
    // Cache to prevent duplicate requests
    const membershipCache = useRef<Map<number, { result: boolean; timestamp: number }>>(new Map());
    const CACHE_DURATION = 5000; // 5 seconds cache

    const joinServer = useCallback(async (serverId: number): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(`${BASE_URL}/api/membership/${serverId}/`);
            setIsUserMember(true);
            // Clear cache since membership status changed
            membershipCache.current.delete(serverId);
        } catch (error: any) {
            // Handle 409 conflict (user already a member) gracefully
            if (error.response?.status === 409) {
                console.log("User is already a member of this server");
                setIsUserMember(true);
                membershipCache.current.delete(serverId);
                // Don't throw error for 409 - it's expected behavior
                return;
            }
            setError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const leaveServer = useCallback(async (serverId: number): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${BASE_URL}/api/membership/${serverId}/remove_member/`);
            setIsUserMember(false);
            // Clear cache since membership status changed
            membershipCache.current.delete(serverId);
        } catch (error: any) {
            setError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const isMember = useCallback(async (serverId: number): Promise<void> => {
        // Check cache first
        const cachedResult = membershipCache.current.get(serverId);
        const now = Date.now();
        
        if (cachedResult && (now - cachedResult.timestamp) < CACHE_DURATION) {
            setIsUserMember(cachedResult.result);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_URL}/api/membership/${serverId}/is_member/`);
            const isMemberResult = response.data.is_member;
            setIsUserMember(isMemberResult);
            
            // Cache the result
            membershipCache.current.set(serverId, {
                result: isMemberResult,
                timestamp: now
            });
        } catch (error: any) {
            // For 401/403 errors (auth issues), don't log or throw - just handle gracefully
            if (error.response?.status === 401 || error.response?.status === 403) {
                setIsUserMember(false);
                setError(null); // Clear any previous errors
                return; // Exit gracefully without throwing
            }
            
            // For 404 errors (endpoint not found), also handle gracefully
            if (error.response?.status === 404) {
                console.warn("Membership endpoint not found - user is not a member");
                setIsUserMember(false);
                setError(null);
                return; // Exit gracefully without throwing
            }
            
            // Only log and handle other errors, but don't throw to prevent infinite loops
            console.error("Error checking membership status:", error);
            setError(error);
            setIsUserMember(false); // Default to not a member on error
        } finally {
            setIsLoading(false);
        }
    }, [CACHE_DURATION]);

    return { joinServer, leaveServer, error, isLoading, isMember, isUserMember };
};

export default useMembership;