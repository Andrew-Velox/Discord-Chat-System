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
  const { isLoggedIn } = useAuthServiceContext();

  useEffect(() => {
    if (!serverId || !isLoggedIn) return;

    const checkMembership = async () => {
      try {
        await isMember(Number(serverId));
      } catch (error) {
        console.error("Error checking membership status:", error);
      }
    };

    checkMembership();
  }, [serverId, isMember, isLoggedIn]); // Now safe to include isMember since it's memoized

  return <>{children}</>;
};

export default MembershipCheck;
