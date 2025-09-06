import { useState, useCallback, useRef } from "react";
import useAxiosWithJwtInterceptor from "../helpers/jwtinterceptor";
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
    const jwtAxios = useAxiosWithJwtInterceptor();
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
            await jwtAxios.post(`${BASE_URL}/membership/${serverId}/membership/`);
            setIsUserMember(true);
            // Clear cache since membership status changed
            membershipCache.current.delete(serverId);
        } catch (error: any) {
            setError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [jwtAxios]);

    const leaveServer = useCallback(async (serverId: number): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            await jwtAxios.delete(`${BASE_URL}/membership/${serverId}/membership/remove_member/`);
            setIsUserMember(false);
            // Clear cache since membership status changed
            membershipCache.current.delete(serverId);
        } catch (error: any) {
            setError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [jwtAxios]);

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
            const response = await jwtAxios.get(`${BASE_URL}/membership/${serverId}/membership/is_member/`);
            const isMemberResult = response.data.is_member;
            setIsUserMember(isMemberResult);
            
            // Cache the result
            membershipCache.current.set(serverId, {
                result: isMemberResult,
                timestamp: now
            });
        } catch (error: any) {
            // Only log error if it's not a 401 (which is expected for non-authenticated users)
            if (error.response?.status !== 401) {
                console.error("Error checking membership status:", error);
            }
            setError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [jwtAxios, CACHE_DURATION]);

    return { joinServer, leaveServer, error, isLoading, isMember, isUserMember };
};

export default useMembership;