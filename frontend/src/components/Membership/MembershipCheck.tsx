import { useEffect } from "react";
import { useMembershipContext } from "../../context/MemberContext";
import { useParams } from "react-router-dom";
import { useAuthServiceContext } from "../../context/AuthContext";

interface MembershipCheckProps {
  children: React.ReactNode;
}

const MembershipCheck: React.FC<MembershipCheckProps> = ({ children }) => {
  const { serverId } = useParams();
  const { isMember } = useMembershipContext();
  const { isLoggedIn, isLoading } = useAuthServiceContext();

  useEffect(() => {
    // Only check membership if:
    // 1. We have a serverId
    // 2. User is definitively logged in (not just loading state)
    // 3. Authentication is complete
    if (!serverId || !isLoggedIn || isLoading) {
      return;
    }

    // Double-check that we're actually authenticated
    const checkMembership = async () => {
      try {
        await isMember(Number(serverId));
      } catch (error: any) {
        // Completely suppress auth-related errors as they're expected
        if (error.response?.status === 401 || error.response?.status === 403) {
          return; // Silently handle auth errors
        }
        // Only log actual unexpected errors
        console.error("Unexpected error checking membership status:", error);
      }
    };

    // Add a small delay to ensure auth state is fully settled
    const timeoutId = setTimeout(checkMembership, 100);
    return () => clearTimeout(timeoutId);
  }, [serverId, isMember, isLoggedIn, isLoading]);

  return <>{children}</>;
};

export default MembershipCheck;
