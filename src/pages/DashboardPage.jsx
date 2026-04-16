import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
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
import {
  CAMERA_TYPES,
  createCamera,
  LENSES,
  PICTURES,
  PURPOSES,
  SPORT_PRESETS
} from '../utils/plannerConfig';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const starter = {
  id: null,
  name: 'New Project',
  event_date: '',
  event_time: '',
  sport_type: 'football',
  pitch_scale: 1,
  cameras: [createCamera(0)]
};

const shellSx = {
  background:
    'linear-gradient(180deg, rgba(14,32,52,0.98) 0%, rgba(6,16,30,0.98) 100%)',
  border: `1px solid ${alpha('#8ec5ff', 0.12)}`,
  boxShadow: `0 20px 60px ${alpha('#000000', 0.35)}`,
  backdropFilter: 'blur(18px)',
  borderRadius: 5
};

const editorCardSx = {
  ...shellSx,
  borderRadius: 5,
  p: 2.25
};

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatRole(role) {
  if (!role) return 'Viewer';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function DashboardPage() {
  const { user, logout, has } = useAuth();
  const stageRef = useRef(null);
  const [project, setProject] = useState(starter);
  const [selectedId, setSelectedId] = useState(starter.cameras[0].id);
  const [status, setStatus] = useState('Starter loaded.');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const titleLine = useMemo(
    () => `${project.name || 'Untitled Project'} • ${SPORT_PRESETS[project.sport_type]?.name || 'Football'}`,
    [project.name, project.sport_type]
  );

  const selectedCamera =
    project.cameras.find((camera) => camera.id === selectedId) || project.cameras[0] || null;

  const setCameras = (updater) => {
    setProject((prev) => ({
      ...prev,
      cameras: typeof updater === 'function' ? updater(prev.cameras) : updater
    }));
  };

  const updateCamera = (cameraId, patch) => {
    setCameras((prev) =>
      prev.map((camera) => (camera.id === cameraId ? { ...camera, ...patch } : camera))
    );
  };

  const addCamera = () => {
    const next = createCamera(project.cameras.length);
    setCameras((prev) => [...prev, next]);
    setSelectedId(next.id);
    setStatus('Camera added.');
  };

  const removeCamera = (cameraId) => {
    const remaining = project.cameras.filter((camera) => camera.id !== cameraId);
    if (!remaining.length) {
      const next = createCamera(0);
      setProject((prev) => ({ ...prev, cameras: [next] }));
      setSelectedId(next.id);
      setStatus('Last camera removed, new starter camera created.');
      return;
    }

    setProject((prev) => ({ ...prev, cameras: remaining }));
    if (selectedId === cameraId) {
      setSelectedId(remaining[0].id);
    }
    setStatus('Camera removed.');
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
          cameras: project.cameras
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
      const nextProject = {
        id: latest.id,
        name: latest.name,
        event_date: latest.event_date || '',
        event_time: latest.event_time || '',
        sport_type: latest.payload_json?.sport_type || latest.sport_type || 'football',
        pitch_scale: latest.payload_json?.pitch_scale || 1,
        cameras: latest.payload_json?.cameras || [createCamera(0)]
      };
      setProject(nextProject);
      setSelectedId(nextProject.cameras[0]?.id || null);
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
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${project.name || 'camera-plan'}.pdf`);
    setStatus('PDF exported.');
  };

  const exportHtml = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${project.name}</title></head><body><pre>${JSON.stringify(project, null, 2)}</pre></body></html>`;
    downloadBlob(
      new Blob([html], { type: 'text/html;charset=utf-8' }),
      `${project.name || 'camera-plan'}.html`
    );
    setStatus('HTML snapshot exported.');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(88,191,255,0.12), transparent 24%), linear-gradient(180deg, #04101d 0%, #020814 100%)'
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: `1px solid ${alpha('#ffffff', 0.07)}`,
          backdropFilter: 'blur(14px)'
        }}
      >
        <Toolbar sx={{ minHeight: 78, gap: 2, alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontSize: { xs: 30, md: 38 }, lineHeight: 1.05 }}>
              Camera Planner
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {titleLine}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Button startIcon={<RestoreRoundedIcon />} variant="outlined" onClick={loadLatest} disabled={loading}>
              Load latest
            </Button>
            <Button startIcon={<SaveRoundedIcon />} variant="contained" onClick={saveProject} disabled={loading || !has('projects:edit')}>
              Save project
            </Button>
            <Chip
              label={`${user?.name || 'User'} • ${formatRole(user?.role_name)}`}
              sx={{
                height: 38,
                fontWeight: 700,
                px: 1,
                borderRadius: 2.5,
                border: `1px solid ${alpha('#b8d4ff', 0.18)}`,
                background: alpha('#1a2740', 0.85)
              }}
            />
            <Button startIcon={<LogoutRoundedIcon />} variant="outlined" color="inherit" onClick={logout}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 } }}>
        {!!error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: 'minmax(760px, 1.6fr) minmax(360px, 0.9fr)' },
            gap: 2.5,
            alignItems: 'start'
          }}
        >
          <Card sx={{ ...shellSx, overflow: 'hidden' }}>
            <CardContent ref={stageRef} sx={{ p: { xs: 1.5, md: 2 } }}>
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

          <Box sx={{ display: 'grid', gap: 2.25 }}>
            <Card sx={editorCardSx}>
              <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.2 }}>
                Project Setup
              </Typography>
              <Box
                sx={{
                  mt: 1.5,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                  gap: 1.5
                }}
              >
                <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 12' } }}>
                  <TextField
                    label="Project Name"
                    fullWidth
                    value={project.name}
                    onChange={(e) => setProject((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 6', sm: 'span 6' } }}>
                  <TextField
                    type="date"
                    label="Event Date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={project.event_date}
                    onChange={(e) => setProject((prev) => ({ ...prev, event_date: e.target.value }))}
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 6', sm: 'span 6' } }}>
                  <TextField
                    type="time"
                    label="Event Time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={project.event_time}
                    onChange={(e) => setProject((prev) => ({ ...prev, event_time: e.target.value }))}
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 7', sm: 'span 7' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Pitch Type</InputLabel>
                    <Select
                      label="Pitch Type"
                      value={project.sport_type}
                      onChange={(e) => setProject((prev) => ({ ...prev, sport_type: e.target.value }))}
                    >
                      {Object.values(SPORT_PRESETS).map((sport) => (
                        <MenuItem key={sport.id} value={sport.id}>
                          {sport.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 5', sm: 'span 5' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                    Pitch Scale
                  </Typography>
                  <Slider
                    min={0.7}
                    max={1.35}
                    step={0.01}
                    value={project.pitch_scale}
                    onChange={(_, value) =>
                      setProject((prev) => ({ ...prev, pitch_scale: value }))
                    }
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                  />
                </Box>
              </Box>

              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
                <Button startIcon={<AddRoundedIcon />} variant="outlined" onClick={addCamera} disabled={!has('projects:edit')}>
                  Add camera
                </Button>
                <Button startIcon={<ImageRoundedIcon />} variant="outlined" onClick={exportPng}>
                  Export PNG
                </Button>
                <Button startIcon={<PictureAsPdfRoundedIcon />} variant="outlined" onClick={exportPdf}>
                  Export PDF
                </Button>
                <Button startIcon={<ShareRoundedIcon />} variant="outlined" onClick={exportHtml}>
                  Share HTML
                </Button>
              </Stack>
            </Card>

            {selectedCamera && (
              <Card sx={editorCardSx}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h6">{selectedCamera.label || 'Selected Camera'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Edit the selected camera from here. The table below stays read-only.
                    </Typography>
                  </Box>
                  <Button
                    startIcon={<DeleteOutlineRoundedIcon />}
                    variant="outlined"
                    color="error"
                    onClick={() => removeCamera(selectedCamera.id)}
                  >
                    Delete
                  </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.2 }}>
                  Camera Setup
                </Typography>
                <Box
                  sx={{
                    mt: 1.5,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                    gap: 1.5
                  }}
                >
                  <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 6' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Purpose</InputLabel>
                      <Select
                        label="Purpose"
                        value={selectedCamera.purpose}
                        onChange={(e) => updateCamera(selectedCamera.id, { purpose: e.target.value })}
                      >
                        {PURPOSES.map((item) => (
                          <MenuItem key={item} value={item}>{item}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 6' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Camera Type</InputLabel>
                      <Select
                        label="Camera Type"
                        value={selectedCamera.cameraType}
                        onChange={(e) => updateCamera(selectedCamera.id, { cameraType: e.target.value })}
                      >
                        {CAMERA_TYPES.map((item) => (
                          <MenuItem key={item} value={item}>{item}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 6' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Lens</InputLabel>
                      <Select
                        label="Lens"
                        value={selectedCamera.lens}
                        onChange={(e) => updateCamera(selectedCamera.id, { lens: e.target.value })}
                      >
                        {LENSES.map((item) => (
                          <MenuItem key={item} value={item}>{item}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 6' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Picture</InputLabel>
                      <Select
                        label="Picture"
                        value={selectedCamera.picture}
                        onChange={(e) => updateCamera(selectedCamera.id, { picture: e.target.value })}
                      >
                        {PICTURES.map((item) => (
                          <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.2 }}>
                  Placement & Framing
                </Typography>
                <Box
                  sx={{
                    mt: 1.5,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                    gap: 1.5,
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 6' } }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                      Angle
                    </Typography>
                    <Slider
                      min={-180}
                      max={180}
                      step={1}
                      value={Number(selectedCamera.angle) || 0}
                      onChange={(_, value) => updateCamera(selectedCamera.id, { angle: value })}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 6' } }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                      FOV
                    </Typography>
                    <Slider
                      min={10}
                      max={120}
                      step={1}
                      value={Number(selectedCamera.fov) || 50}
                      onChange={(_, value) => updateCamera(selectedCamera.id, { fov: value })}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 6' } }}>
                    <TextField
                      label="X Position %"
                      type="number"
                      fullWidth
                      value={Number(selectedCamera.x).toFixed(1)}
                      onChange={(e) =>
                        updateCamera(selectedCamera.id, {
                          x: Math.max(0, Math.min(100, Number(e.target.value) || 0))
                        })
                      }
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 6' } }}>
                    <TextField
                      label="Y Position %"
                      type="number"
                      fullWidth
                      value={Number(selectedCamera.y).toFixed(1)}
                      onChange={(e) =>
                        updateCamera(selectedCamera.id, {
                          y: Math.max(0, Math.min(100, Number(e.target.value) || 0))
                        })
                      }
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 6' } }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Switch
                        checked={!!selectedCamera.mirror}
                        onChange={(e) => updateCamera(selectedCamera.id, { mirror: e.target.checked })}
                      />
                      <Typography>Mirror</Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 6' } }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Switch
                        checked={!!selectedCamera.locked}
                        onChange={(e) => updateCamera(selectedCamera.id, { locked: e.target.checked })}
                      />
                      <Typography>Lock position</Typography>
                    </Stack>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.2 }}>
                  Notes
                </Typography>
                <TextField
                  sx={{ mt: 1.5 }}
                  fullWidth
                  multiline
                  minRows={4}
                  label="Camera Notes"
                  placeholder="Cable route, platform, safety notes, mounting point, lens plan..."
                  value={selectedCamera.loc || ''}
                  onChange={(e) => updateCamera(selectedCamera.id, { loc: e.target.value })}
                />
              </Card>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Card sx={shellSx}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Cameras Overview</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Click any row to select a camera. Editing happens in the right-side control panel.
              </Typography>
              <CamerasTable
                cameras={project.cameras}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
              />
            </CardContent>
          </Card>
        </Box>

        <Alert severity="info" sx={{ mt: 2.5 }}>
          {status}
        </Alert>
      </Box>
    </Box>
  );
}
