import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#07111f' }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? <DashboardPage /> : <LoginPage />;
}
