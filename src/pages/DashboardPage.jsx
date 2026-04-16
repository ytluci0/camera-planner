import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import { alpha } from '@mui/material/styles';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PlannerCanvas from '../components/PlannerCanvas';
import CamerasTable from '../components/CamerasTable';
import { createCamera, SPORT_PRESETS } from '../utils/plannerConfig';
import { glass } from '../theme';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const starter = {
  id: null,
  name: 'New Project',
  event_date: '',
  event_time: '',
  sport_type: 'football',
  pitch_scale: 1,
  cameras: [createCamera(0)],
  notes: ''
};

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DashboardPage() {
  const { user, logout, has } = useAuth();
  const stageRef = useRef(null);
  const [project, setProject] = useState(starter);
  const [selectedId, setSelectedId] = useState(starter.cameras[0].id);
  const [status, setStatus] = useState('Starter loaded.');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const titleLine = useMemo(() => `${project.name || 'Untitled Project'} • ${SPORT_PRESETS[project.sport_type]?.name || 'Football'}`, [project.name, project.sport_type]);

  const setCameras = (updater) => {
    setProject((prev) => ({
      ...prev,
      cameras: typeof updater === 'function' ? updater(prev.cameras) : updater
    }));
  };

  const addCamera = () => {
    setCameras((prev) => [...prev, createCamera(prev.length)]);
    setStatus('Camera added.');
  };

  const saveProject = async () => {
    setLoading(true);
    setError('');
    try {
      const body = {
        ...project,
        payload_json: {
          sport_type: project.sport_type,
          pitch_scale: project.pitch_scale,
          cameras: project.cameras,
          notes: project.notes
        }
      };
      const data = project.id
        ? await api.put(`/api/projects/${project.id}`, body)
        : await api.post('/api/projects', body);
      setProject((prev) => ({ ...prev, id: data.project.id }));
      setStatus(`Saved project #${data.project.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLatest = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/projects?limit=1');
      const latest = data.projects?.[0];
      if (!latest) {
        setStatus('No projects found in database yet.');
        return;
      }
      setProject({
        id: latest.id,
        name: latest.name,
        event_date: latest.event_date || '',
        event_time: latest.event_time || '',
        sport_type: latest.payload_json?.sport_type || latest.sport_type || 'football',
        pitch_scale: latest.payload_json?.pitch_scale || 1,
        cameras: latest.payload_json?.cameras || [createCamera(0)],
        notes: latest.payload_json?.notes || ''
      });
      setSelectedId(latest.payload_json?.cameras?.[0]?.id || null);
      setStatus(`Loaded latest project: ${latest.name}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportPng = async () => {
    const node = stageRef.current;
    if (!node) return;
    const canvas = await html2canvas(node, { backgroundColor: '#07111f', scale: 2 });
    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `${project.name || 'camera-plan'}.png`);
    });
    setStatus('PNG exported.');
  };

  const exportPdf = async () => {
    const node = stageRef.current;
    if (!node) return;
    const canvas = await html2canvas(node, { backgroundColor: '#07111f', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${project.name || 'camera-plan'}.pdf`);
    setStatus('PDF exported.');
  };

  const exportHtml = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${project.name}</title></head><body><pre>${JSON.stringify(project, null, 2)}</pre></body></html>`;
    downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `${project.name || 'camera-plan'}.html`);
    setStatus('HTML snapshot exported.');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(110,231,255,0.10), transparent 28%), linear-gradient(180deg, #07111f 0%, #030712 100%)' }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`, backdropFilter: 'blur(14px)' }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5">Camera Planner</Typography>
            <Typography variant="caption" color="text.secondary">{titleLine}</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button startIcon={<RestoreRoundedIcon />} variant="outlined" onClick={loadLatest} disabled={loading}>Load latest</Button>
            <Button startIcon={<SaveRoundedIcon />} variant="contained" onClick={saveProject} disabled={loading || !has('projects:edit')}>Save project</Button>
            <Button startIcon={<LogoutRoundedIcon />} variant="outlined" color="inherit" onClick={logout}>Logout</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Card sx={{ ...glass('#8b5cf6'), borderRadius: 5 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}><TextField label="Project Name" fullWidth value={project.name} onChange={(e) => setProject((prev) => ({ ...prev, name: e.target.value }))} /></Grid>
                  <Grid item xs={6} md={2}><TextField type="date" label="Event Date" fullWidth InputLabelProps={{ shrink: true }} value={project.event_date} onChange={(e) => setProject((prev) => ({ ...prev, event_date: e.target.value }))} /></Grid>
                  <Grid item xs={6} md={2}><TextField type="time" label="Event Time" fullWidth InputLabelProps={{ shrink: true }} value={project.event_time} onChange={(e) => setProject((prev) => ({ ...prev, event_time: e.target.value }))} /></Grid>
                  <Grid item xs={12} md={2.5}>
                    <FormControl fullWidth>
                      <InputLabel>Pitch Type</InputLabel>
                      <Select label="Pitch Type" value={project.sport_type} onChange={(e) => setProject((prev) => ({ ...prev, sport_type: e.target.value }))}>
                        {Object.values(SPORT_PRESETS).map((sport) => <MenuItem key={sport.id} value={sport.id}>{sport.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2.5}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>Pitch Scale</Typography>
                    <Slider min={0.7} max={1.35} step={0.01} value={project.pitch_scale} onChange={(_, value) => setProject((prev) => ({ ...prev, pitch_scale: value }))} valueLabelDisplay="auto" valueLabelFormat={(value) => `${Math.round(value * 100)}%`} />
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                  <Button startIcon={<AddRoundedIcon />} variant="outlined" onClick={addCamera} disabled={!has('projects:edit')}>Add camera</Button>
                  <Button startIcon={<ImageRoundedIcon />} variant="outlined" onClick={exportPng}>Export PNG</Button>
                  <Button startIcon={<PictureAsPdfRoundedIcon />} variant="outlined" onClick={exportPdf}>Export PDF</Button>
                  <Button startIcon={<ShareRoundedIcon />} variant="outlined" onClick={exportHtml}>Share HTML</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={7.5}>
            <Card sx={{ ...glass('#6ee7ff'), borderRadius: 5 }}>
              <CardContent ref={stageRef}>
                <PlannerCanvas
                  sport={project.sport_type}
                  cameras={project.cameras}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  setCameras={setCameras}
                  scale={project.pitch_scale}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4.5}>
            <Card sx={{ ...glass('#6ee7ff'), borderRadius: 5, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Role & Access</Typography>
                <Typography variant="body2" color="text.secondary">Signed in as <strong>{user?.name}</strong> ({user?.role_name})</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Permissions: {(user?.permissions || []).join(', ') || 'none'}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ ...glass('#6ee7ff'), borderRadius: 5 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1.5 }}>Cameras</Typography>
                <Divider sx={{ mb: 2 }} />
                <CamerasTable cameras={project.cameras} selectedId={selectedId} setSelectedId={setSelectedId} setCameras={setCameras} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ ...glass('#8b5cf6'), borderRadius: 5 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1.5 }}>Project Notes</Typography>
                <TextField multiline minRows={4} fullWidth value={project.notes} onChange={(e) => setProject((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Match notes, rig notes, cable path notes, operator comments..." />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2.5 }}>
          {error ? <Alert severity="error">{error}</Alert> : <Alert severity="info">{status}</Alert>}
        </Box>
      </Box>
    </Box>
  );
}
