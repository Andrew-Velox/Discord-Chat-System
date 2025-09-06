import { useMembershipContext } from "../../context/MemberContext";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button, Box, Alert, Snackbar } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useState } from "react";

const JoinServerButton = () => {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const { joinServer, leaveServer, isLoading, isUserMember } =
    useMembershipContext();
  
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showError, setShowError] = useState(false);

  const handleJoinServer = async () => {
    try {
      await joinServer(Number(serverId));
      navigate(`/server/${serverId}/`);
      console.log("User has joined server");
    } catch (error: any) {
      console.log("Error joining", error);
      setErrorMessage("Failed to join server. Please try again.");
      setShowError(true);
    }
  };

  const handleLeaveServer = async () => {
    try {
      await leaveServer(Number(serverId));
      navigate(`/server/${serverId}/`);
      console.log("User has left the server successfully!");
    } catch (error: any) {
      console.error("Error leaving the server:", error);
      let message = "Failed to leave server. Please try again.";
      
      if (error.response?.status === 409) {
        message = "Cannot leave server. You might be the server owner or admin.";
      } else if (error.response?.status === 403) {
        message = "Permission denied. You don't have access to leave this server.";
      } else if (error.response?.status === 404) {
        message = "Server not found or you're not a member.";
      }
      
      setErrorMessage(message);
      setShowError(true);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
    setErrorMessage("");
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 1 }}>
        <Button
          variant="contained"
          disabled
          size="small"
          sx={{
            py: 0.8,
            px: 2,
            borderRadius: 1.5,
            fontSize: "0.875rem",
          }}
        >
          Loading...
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 1 }}>
        {isUserMember ? (
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<ExitToAppIcon />}
            onClick={handleLeaveServer}
            sx={{
              py: 0.8,
              px: 2,
              borderRadius: 1.5,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.875rem",
              background: "linear-gradient(45deg, #f44336 30%, #e57373 90%)",
              boxShadow: "0 2px 4px 1px rgba(244, 67, 54, .2)",
              "&:hover": {
                background: "linear-gradient(45deg, #d32f2f 30%, #f44336 90%)",
                boxShadow: "0 4px 8px 2px rgba(244, 67, 54, .3)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Leave Server
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={handleJoinServer}
            sx={{
              py: 0.8,
              px: 2,
              borderRadius: 1.5,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.875rem",
              background: "linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)",
              boxShadow: "0 2px 4px 1px rgba(33, 150, 243, .2)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976D2 30%, #2196F3 90%)",
                boxShadow: "0 4px 8px 2px rgba(33, 150, 243, .3)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Join Server
          </Button>
        )}
      </Box>
      
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
export default JoinServerButton;
