import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthService } from "../services/AuthServices";

const useAxiosWithJwtInterceptor = () => {
  const jwtAxios = axios.create({
    withCredentials: true, // Always send cookies
  });
  const navigate = useNavigate();
  const { logout, refreshAccessToken } = useAuthService();

  // Handle authentication errors with automatic token refresh
  jwtAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the access token
          await refreshAccessToken();
          // Retry the original request
          return jwtAxios(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          logout();
          navigate("/login");
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 403) {
        logout();
        navigate("/login");
      }
      
      return Promise.reject(error);
    }
  );

  return jwtAxios;
};

export default useAxiosWithJwtInterceptor;
