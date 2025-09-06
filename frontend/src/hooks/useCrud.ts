import useAxiosWithInterceptor from "../helpers/jwtinterceptor";
import { BASE_URL } from "../config";
import { useState } from 'react';

interface IuseCrud<T> {
    dataCRUD: T[];
    fetchData: () => Promise<T[]>;
    error: Error | null;
    isLoading: boolean;
}

const useCrud = <T>(initialData: T[], apiURL: string): IuseCrud<T> => {
    const jwtAxios = useAxiosWithInterceptor();
    const [dataCRUD, setDataCRUD] = useState<T[]>(initialData);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async (): Promise<T[]> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await jwtAxios.get(`${BASE_URL}${apiURL}`);
            const data = response.data;
            setDataCRUD(data);
            return data;
        } catch (error: any) {
            setError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { fetchData, dataCRUD, error, isLoading };
};

export default useCrud;