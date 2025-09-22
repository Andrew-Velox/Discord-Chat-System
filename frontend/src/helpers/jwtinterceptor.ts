import axios from "../utils/axios"; // Use configured axios

const useAxiosWithJwtInterceptor = () => {
  // Return the main axios instance with Token authentication
  // This maintains backward compatibility while using Token auth
  return axios;
};

export default useAxiosWithJwtInterceptor;
