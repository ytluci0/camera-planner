import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import { alpha } from '@mui/material/styles';
import { glass } from '../theme';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { key: 'editor', path: '/editor', label: 'Editor', icon: <TuneRoundedIcon /> },
  { key: 'database', path: '/admin/database', label: 'Database', icon: <StorageRoundedIcon /> },
  { key: 'projects', path: '/projects', label: 'Projects', icon: <FolderRoundedIcon /> }
];

const panelSx = {
  ...glass('#6ee7ff', 0.12),
  borderRadius: '16px',
  background: 'linear-gradient(180deg, rgba(16,38,64,0.92) 0%, rgba(7,20,38,0.97) 100%)',
  border: '1px solid rgba(255,255,255,0.1)'
};

function GenericReferenceCard({ title, rows, apiType, refresh }) {
  const [form, setForm] = useState({ id: null, name: '' });
  const [busy, setBusy] = useState(false);

  const resetForm = () => setForm({ id: null, name: '' });

  const submit = async () => {
    const name = form.name.trim();
    if (!name) return;

    setBusy(true);
    try {
      if (form.id) {
        await api.put(`/api/admin/reference/${apiType}`, { id: form.id, name });
      } else {
        await api.post(`/api/admin/reference/${apiType}`, { name });
      }
      resetForm();
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await api.request(`/api/admin/reference/${apiType}`, {
        method: 'DELETE',
        body: JSON.stringify({ id })
      });
      if (form.id === id) resetForm();
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={panelSx}>
      <CardContent sx={{ p: 2.25 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>{title}</Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label={form.id ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Button
            variant="contained"
            startIcon={form.id ? <SaveRoundedIcon /> : <AddRoundedIcon />}
            onClick={submit}
            disabled={busy}
          >
            {form.id ? 'Update' : 'Add'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RestartAltRoundedIcon />}
            onClick={resetForm}
            disabled={busy}
          >
            Clear
          </Button>
        </Stack>

        <Divider sx={{ mb: 1.5, borderColor: alpha('#fff', 0.08) }} />

        <Stack spacing={1}>
          {rows.length === 0 ? (
            <Typography color="text.secondary">No items yet.</Typography>
          ) : rows.map((row) => (
            <Box
              key={row.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 1,
                alignItems: 'center',
                px: 1.25,
                py: 1,
                borderRadius: 2,
                bgcolor: alpha('#fff', 0.03),
                border: `1px solid ${alpha('#fff', 0.06)}`
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>{row.name}</Typography>
              <IconButton size="small" onClick={() => setForm({ id: row.id, name: row.name })}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => remove(row.id)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PicturesCard({ rows, refresh }) {
  const [form, setForm] = useState({ id: null, name: '', key: '', url: '' });
  const [busy, setBusy] = useState(false);

  const resetForm = () => setForm({ id: null, name: '', key: '', url: '' });

  const submit = async () => {
    const payload = {
      id: form.id || undefined,
      name: form.name.trim(),
      key: form.key.trim(),
      url: form.url.trim()
    };

    if (!payload.name || !payload.key || !payload.url) return;

    setBusy(true);
    try {
      if (form.id) {
        await api.put('/api/admin/reference/pictures', payload);
      } else {
        await api.post('/api/admin/reference/pictures', payload);
      }
      resetForm();
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await api.request('/api/admin/reference/pictures', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      });
      if (form.id === id) resetForm();
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={panelSx}>
      <CardContent sx={{ p: 2.25 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>Pictures</Typography>

        <Grid container spacing={1.25} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Picture Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Picture ID / Key"
              value={form.key}
              onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))}
              placeholder="broadcast"
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Image URL"
              value={form.url}
              onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="/assets/2.png"
            />
          </Grid>
        </Grid>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={form.id ? <SaveRoundedIcon /> : <AddRoundedIcon />}
            onClick={submit}
            disabled={busy}
          >
            {form.id ? 'Update' : 'Add'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RestartAltRoundedIcon />}
            onClick={resetForm}
            disabled={busy}
          >
            Clear
          </Button>
        </Stack>

        <Divider sx={{ mb: 1.5, borderColor: alpha('#fff', 0.08) }} />

        <Stack spacing={1}>
          {rows.length === 0 ? (
            <Typography color="text.secondary">No pictures yet.</Typography>
          ) : rows.map((row) => (
            <Box
              key={row.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr auto auto',
                gap: 1,
                alignItems: 'center',
                px: 1.25,
                py: 1,
                borderRadius: 2,
                bgcolor: alpha('#fff', 0.03),
                border: `1px solid ${alpha('#fff', 0.06)}`
              }}
            >
              <Box
                component="img"
                src={row.url}
                alt={row.name}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1.5,
                  objectFit: 'contain',
                  bgcolor: alpha('#fff', 0.04),
                  border: `1px solid ${alpha('#fff', 0.06)}`
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{row.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {row.key}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {row.url}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setForm({ id: row.id, name: row.name, key: row.key, url: row.url })}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => remove(row.id)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AdminDatabasePage({ onNavigate = () => {} }) {
  const { user, logout } = useAuth();
  const [refs, setRefs] = useState({
    cameraTypes: [],
    cameraPurposes: [],
    lenses: [],
    pictures: []
  });
  const [status, setStatus] = useState('Loading database lists...');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/admin/reference');
      setRefs({
        cameraTypes: data.cameraTypes || [],
        cameraPurposes: data.cameraPurposes || [],
        lenses: data.lenses || [],
        pictures: data.pictures || []
      });
      setStatus('Database lists loaded.');
    } catch (err) {
      setError(err.message || 'Failed to load database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(110,231,255,0.12), transparent 24%), linear-gradient(180deg, #07111f 0%, #030712 100%)' }}>
      <Box sx={{ px: { xs: 2, md: 3 }, py: 2.25, borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`, backdropFilter: 'blur(14px)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} flexWrap="wrap">
          <Box>
            <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 42 }, lineHeight: 1.05, fontWeight: 800 }}>Database Manager</Typography>
            <Typography variant="body2" color="text.secondary">Manage purposes, camera types, lenses, and picture dropdowns from the dashboard.</Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.key}
                variant={window.location.pathname === item.path ? 'contained' : 'outlined'}
                startIcon={item.icon}
                onClick={() => onNavigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
            <Button variant="outlined" color="inherit" sx={{ px: 1.6 }}>
              {`${user?.name || 'User'} • ${user?.role_name || 'viewer'}`}
            </Button>
            <Button startIcon={<LogoutRoundedIcon />} variant="outlined" color="inherit" onClick={logout}>
              Logout
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1800px', mx: 'auto' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} xl={3}>
            <GenericReferenceCard
              title="Purposes"
              rows={refs.cameraPurposes}
              apiType="purposes"
              refresh={loadData}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <GenericReferenceCard
              title="Camera Types"
              rows={refs.cameraTypes}
              apiType="camera-types"
              refresh={loadData}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <GenericReferenceCard
              title="Lenses"
              rows={refs.lenses}
              apiType="lenses"
              refresh={loadData}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <PicturesCard
              rows={refs.pictures}
              refresh={loadData}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          {error ? <Alert severity="error">{error}</Alert> : <Alert severity={loading ? 'info' : 'success'}>{status}</Alert>}
        </Box>
      </Box>
    </Box>
  );
}