import axios from "../utils/axios"; // Use configured axios

const useAxiosWithJwtInterceptor = () => {
  const jwtAxios = axios.create({
    withCredentials: true, // Always send cookies
  });

  // Handle authentication errors - simplified to avoid logout loops
  jwtAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Don't handle auth errors automatically to prevent logout loops
      // Just pass through the error and let components handle it
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("JWT Interceptor: Auth error detected, letting component handle it");
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    }
  );

  return jwtAxios;
};

export default useAxiosWithJwtInterceptor;
