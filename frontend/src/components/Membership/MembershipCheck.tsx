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
    // 2. User is logged in
    // 3. Authentication is not still loading
    if (!serverId || !isLoggedIn || isLoading) return;

    const checkMembership = async () => {
      try {
        await isMember(Number(serverId));
      } catch (error) {
        console.error("Error checking membership status:", error);
      }
    };

    checkMembership();
  }, [serverId, isMember, isLoggedIn, isLoading]); // Include isLoading to prevent premature calls

  return <>{children}</>;
};

export default MembershipCheck;
