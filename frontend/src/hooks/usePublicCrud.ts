import axios from "axios";
import { BASE_URL } from "../config";
import { useState, useCallback } from 'react';

interface IusePublicCrud<T> {
    dataCRUD: T[];
    fetchData: () => Promise<T[]>;
    error: Error | null;
    isLoading: boolean;
}

const usePublicCrud = <T>(initialData: T[], apiURL: string): IusePublicCrud<T> => {
    const [dataCRUD, setDataCRUD] = useState<T[]>(initialData);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async (): Promise<T[]> => {
        setIsLoading(true);
        setError(null);
        console.log('Fetching from URL:', `${BASE_URL}${apiURL}`); // Debug log
        try {
            const response = await axios.get(`${BASE_URL}${apiURL}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10 second timeout
            });
            const data = response.data;
            console.log('Public API response:', data); // Debug log
            
            // Ensure data is always set, even if there are other network issues
            if (Array.isArray(data)) {
                setDataCRUD(data);
                return data;
            } else {
                console.warn('API response is not an array:', data);
                setDataCRUD([]);
                return [];
            }
        } catch (error: any) {
            console.error('Public API error:', error); // Debug log
            
            // If we got a response but there's a network error, try to extract data
            if (error.response && error.response.data) {
                console.log('Extracting data from error response:', error.response.data);
                const data = error.response.data;
                if (Array.isArray(data)) {
                    setDataCRUD(data);
                    return data;
                }
            }
            
            setError(error);
            setDataCRUD([]); // Set empty array on error
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [apiURL]);

    return { fetchData, dataCRUD, error, isLoading };
};

export default usePublicCrud;
