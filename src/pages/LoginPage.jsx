import React, { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { glass } from '../theme';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@planner.local');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, background: 'radial-gradient(circle at top, rgba(110,231,255,0.14), transparent 35%), linear-gradient(180deg, #07111f 0%, #030712 100%)' }}>
      <Card sx={{ width: '100%', maxWidth: 460, borderRadius: 6, ...glass('#6ee7ff') }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>Camera Planner</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            React + MUI starter for Cloudflare Pages, D1, and R2.
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2.2}>
              <TextField
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  fullWidth
  autoComplete="off"
  inputProps={{ autoComplete: 'off' }}
/>

<TextField
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  fullWidth
  autoComplete="new-password"
  inputProps={{ autoComplete: 'new-password' }}
/><Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
              {/* Hidden in production */}
{/* 
<Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha('#ffffff', 0.04) }}>
  Seed user in the included SQL: <strong>admin@planner.local</strong> / <strong>ChangeMe123!</strong>
</Box>
*/}
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
