import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography
} from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { glass } from '../theme';
import { api } from '../utils/api';
import PlannerCanvas from '../components/PlannerCanvas';
import CamerasTable from '../components/CamerasTable';

const panelSx = {
  ...glass('#6ee7ff', 0.12),
  borderRadius: '16px',
  background: 'linear-gradient(180deg, rgba(16,38,64,0.92) 0%, rgba(7,20,38,0.97) 100%)',
  border: '1px solid rgba(255,255,255,0.1)'
};

export default function ViewerPage({ search = '', onNavigate = () => {} }) {
  const [project, setProject] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const projectId = useMemo(() => new URLSearchParams(search).get('projectId'), [search]);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError('Missing projectId in URL.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await api.get(`/api/projects/${projectId}`);
        const loaded = data.project;
        const cameras = loaded.payload_json?.cameras || [];
        setProject({
  id: loaded.id,
  name: loaded.name,
  event_date: loaded.event_date || '',
  event_time: loaded.event_time || '',
  sport_type: loaded.payload_json?.sport_type || loaded.sport_type || 'football',
  pitch_scale: loaded.payload_json?.pitch_scale || 1,
  activeLevels: loaded.payload_json?.activeLevels || [1, 2, 3],
  cameras,
  notes: loaded.payload_json?.notes || ''
});
        setSelectedId(cameras[0]?.id || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1680px', mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 800 }}>Viewer</Typography>
          <Typography color="text.secondary">
            Review the saved camera field and overview without editing.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="outlined" onClick={() => onNavigate('/projects')}>Back to Projects</Button>
          {project?.id ? (
            <Button
              variant="contained"
              startIcon={<OpenInNewRoundedIcon />}
              onClick={() => onNavigate(`/editor?projectId=${project.id}`)}
            >
              Open in Editor
            </Button>
          ) : null}
        </Stack>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {project ? (
        <>
          <Card sx={{ ...panelSx, mb: 2.5 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 800 }}>{project.name}</Typography>
                  <Typography color="text.secondary">Event: {project.event_date || '—'} {project.event_time || ''}</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary">Mode: Viewer</Typography>
                  <Typography color="text.secondary">Sport: {project.sport_type}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ ...panelSx, mb: 2.5 }}>
            <CardContent>
              <PlannerCanvas
  sport={project.sport_type}
  cameras={project.cameras}
  selectedId={selectedId}
  setSelectedId={setSelectedId}
  setCameras={() => {}}
  scale={project.pitch_scale}
  readOnly
  activeLevels={project.activeLevels}
/>
            </CardContent>
          </Card>

          <Card sx={panelSx}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 1.25, fontWeight: 800 }}>Cameras Overview</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>Read-only overview of all cameras in this saved project.</Typography>
              <CamerasTable cameras={project.cameras} selectedId={selectedId} setSelectedId={setSelectedId} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </Box>
  );
}
