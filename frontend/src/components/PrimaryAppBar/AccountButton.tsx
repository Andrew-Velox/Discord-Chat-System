import { Box, IconButton, Menu, MenuItem, Divider } from "@mui/material";
import { AccountCircle, Login, PersonAdd, Logout } from "@mui/icons-material";
import DarkModeSwitch from "./DarkMode/DarkModeSwitch";
import { useState } from "react";
import { useAuthServiceContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AccountButton = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isLoggedIn, logout } = useAuthServiceContext();
  const navigate = useNavigate();

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    handleMenuClose();
    navigate("/login");
  };

  const handleRegister = () => {
    handleMenuClose();
    navigate("/register");
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      open={isMenuOpen}
      keepMounted
      onClose={handleMenuClose}
    >
      <MenuItem>
        <DarkModeSwitch />
      </MenuItem>
      <Divider />
      {isLoggedIn ? (
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      ) : [
        <MenuItem key="login" onClick={handleLogin}>
          <Login sx={{ mr: 1 }} />
          Login
        </MenuItem>,
        <MenuItem key="register" onClick={handleRegister}>
          <PersonAdd sx={{ mr: 1 }} />
          Register
        </MenuItem>
      ]}
    </Menu>
  );

  return (
    <Box sx={{ display: { xs: "flex" } }}>
      <IconButton edge="end" color="inherit" onClick={handleProfileMenuOpen}>
        <AccountCircle />
      </IconButton>
      {renderMenu}
    </Box>
  );
};
export default AccountButton;
