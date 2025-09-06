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
            setDataCRUD(data);
            console.log('Public API response:', data); // Debug log
            return data;
        } catch (error: any) {
            console.error('Public API error:', error); // Debug log
            setError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [apiURL]);

    return { fetchData, dataCRUD, error, isLoading };
};

export default usePublicCrud;
