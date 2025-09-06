import { useEffect } from "react";
import { useAuthServiceContext } from "../../context/AuthContext";

const TokenRefresh: React.FC = () => {
  const { isLoggedIn, refreshAccessToken } = useAuthServiceContext();

  useEffect(() => {
    if (!isLoggedIn) return;

    // Refresh token every 24 hours (before 30-day expiry, but access tokens are long-lived now)
    const refreshInterval = setInterval(async () => {
      try {
        await refreshAccessToken();
        console.log("Token refreshed successfully");
      } catch (error) {
        console.error("Failed to refresh token:", error);
        // The refreshAccessToken function will handle logout on failure
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => clearInterval(refreshInterval);
  }, [isLoggedIn, refreshAccessToken]);

  return null; // This component doesn't render anything
};

export default TokenRefresh;
