import { useEffect } from "react";
import { useMembershipContext } from "../../context/MemberContext";
import { useParams } from "react-router-dom";

interface MembershipCheckProps {
  children: React.ReactNode;
}

const MembershipCheck: React.FC<MembershipCheckProps> = ({ children }) => {
  const { serverId } = useParams();
  const { isMember } = useMembershipContext();

  useEffect(() => {
    if (!serverId) return;

    const checkMembership = async () => {
      try {
        await isMember(Number(serverId));
      } catch (error) {
        console.error("Error checking membership status:", error);
      }
    };

    checkMembership();
  }, [serverId, isMember]); // Now safe to include isMember since it's memoized

  return <>{children}</>;
};

export default MembershipCheck;
