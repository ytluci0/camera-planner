import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { useAuth } from './context/AuthContext';

const NAV_ITEMS = [
  { key: 'editor', path: '/editor', label: 'Editor' },
  { key: 'admin', path: '/admin', label: 'Admin' },
  { key: 'projects', path: '/projects', label: 'Projects' }
];

function navigateTo(path) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function PlaceholderPage({ title, description, onNavigate }) {
  return (
    <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(110,231,255,0.12), transparent 24%), linear-gradient(180deg, #07111f 0%, #030712 100%)' }}>
      <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5, borderBottom: `1px solid ${alpha('#ffffff', 0.08)}` }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.key}
              variant={window.location.pathname === item.path ? 'contained' : 'outlined'}
              onClick={() => onNavigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
        <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 42 }, fontWeight: 800 }}>Camera Planner</Typography>
      </Box>

      <Box sx={{ maxWidth: 980, mx: 'auto', p: { xs: 2, md: 4 } }}>
        <Card sx={{ borderRadius: 4, background: 'linear-gradient(180deg, rgba(18,40,66,0.92) 0%, rgba(8,18,34,0.96) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 1.5 }}>{title}</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>{description}</Typography>
            <Typography color="text.secondary">This page is now routed and ready, so you can build it later without changing the URL structure again.</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const syncPath = () => {
      const next = window.location.pathname || '/';
      if (next === '/') {
        navigateTo('/editor');
        setPathname('/editor');
        return;
      }
      setPathname(next);
    };

    syncPath();
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  const page = useMemo(() => {
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/projects')) return 'projects';
    return 'editor';
  }, [pathname]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#07111f' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <LoginPage />;

  if (page === 'admin') {
    return <PlaceholderPage title="Admin" description="Admin tools placeholder." onNavigate={navigateTo} />;
  }

  if (page === 'projects') {
    return <PlaceholderPage title="Projects" description="Saved projects placeholder." onNavigate={navigateTo} />;
  }

  return <DashboardPage pathname={pathname} onNavigate={navigateTo} />;
}
