import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthService } from "../services/AuthServices";

const useAxiosWithJwtInterceptor = () => {
  const jwtAxios = axios.create({
    withCredentials: true, // Always send cookies
  });
  const navigate = useNavigate();
  const { logout } = useAuthService();

  // Handle authentication errors
  jwtAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        navigate("/login");
      }
      return Promise.reject(error);
    }
  );

  return jwtAxios;
};

export default useAxiosWithJwtInterceptor;
