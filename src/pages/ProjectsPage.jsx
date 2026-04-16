import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography
} from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { glass } from '../theme';
import { api } from '../utils/api';

const cardSx = {
  ...glass('#6ee7ff', 0.12),
  borderRadius: '16px',
  background: 'linear-gradient(180deg, rgba(16,38,64,0.92) 0%, rgba(7,20,38,0.97) 100%)',
  border: '1px solid rgba(255,255,255,0.1)'
};

export default function ProjectsPage({ onNavigate = () => {} }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/projects?limit=100');
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openProject = (projectId) => {
    onNavigate(`/editor?projectId=${projectId}`);
  };

  const viewProject = (projectId) => {
    onNavigate(`/viewer?projectId=${projectId}`);
  };

  const removeProject = async (projectId) => {
    try {
      await api.delete(`/api/projects/${projectId}`);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1600px', mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 800 }}>Projects</Typography>
          <Typography color="text.secondary">Open a saved camera plan in the Editor or review it in Viewer mode.</Typography>
        </Box>
        <Button variant="outlined" onClick={loadProjects}>Refresh</Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ minHeight: 220, display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!loading && !projects.length ? (
        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>No saved projects yet</Typography>
            <Typography color="text.secondary">Save a project from the Editor tab and it will appear here.</Typography>
          </CardContent>
        </Card>
      ) : null}

      <Stack spacing={2}>
        {projects.map((project) => (
          <Card key={project.id} sx={cardSx}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h6">{project.name}</Typography>
                    <Chip size="small" label={project.payload_json?.sport_type || project.sport_type || 'football'} variant="outlined" />
                    <Chip size="small" label={`${project.payload_json?.cameras?.length || 0} cameras`} variant="outlined" />
                  </Stack>
                  <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                    Event: {project.event_date || '—'} {project.event_time || ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Updated: {project.updated_at ? new Date(project.updated_at.replace(' ', 'T')).toLocaleString() : '—'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="outlined" startIcon={<VisibilityRoundedIcon />} onClick={() => viewProject(project.id)}>
                    Open in Viewer
                  </Button>
                  <Button variant="contained" startIcon={<OpenInNewRoundedIcon />} onClick={() => openProject(project.id)}>
                    Open in Editor
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => removeProject(project.id)}>
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
