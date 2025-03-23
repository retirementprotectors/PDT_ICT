import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}!
      </Typography>
      <Typography variant="body1" gutterBottom>
        This is your dashboard. More features coming soon!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogout}
        sx={{ mt: 2 }}
      >
        Logout
      </Button>
    </Box>
  );
} 