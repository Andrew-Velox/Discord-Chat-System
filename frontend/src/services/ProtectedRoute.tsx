import { Navigate } from "react-router-dom";
import { useAuthServiceContext } from "../context/AuthContext";
import { CircularProgress, Box } from "@mui/material";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAuthServiceContext();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Redirect to login if not authenticated (after loading is complete)
  if (!isLoggedIn) {
    return <Navigate to="/login" replace={true} />;
  }
  
  console.log("test");
  return <>{children}</>; // Wrapping children in a React fragment
};

export default ProtectedRoute;
