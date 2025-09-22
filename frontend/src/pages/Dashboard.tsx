import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { ExitToApp, PersonAdd, Computer } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Server, Category } from '../types';

const Dashboard = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const [serversResponse, categoriesResponse] = await Promise.all([
        api.get('/api/server/select/'),
        api.get('/api/server/category/')
      ]);
      
      setServers(serversResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // If there's an auth error, the api interceptor will handle redirect
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]); // Remove fetchData from dependencies to avoid infinite loop

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6">Loading servers...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Computer sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MeowChat
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {user?.first_name || user?.username}!
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Available Servers
        </Typography>
        
        {servers.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No servers available
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Check back later for new servers to join!
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 3,
            }}
          >
            {servers.map((server) => (
              <Card key={server.id} elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {server.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {server.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={getCategoryName(server.category)}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    Owner: {server.owner_name || 'Unknown'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    variant="contained" 
                    startIcon={<PersonAdd />}
                    fullWidth
                  >
                    Join Server
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;