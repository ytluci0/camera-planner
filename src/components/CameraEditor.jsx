import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { CAMERA_TYPES, LENSES, PICTURES, PURPOSES } from '../utils/plannerConfig';
import { api } from '../utils/api';
import { glass } from '../theme';

function normalizeReferenceData(data) {
  return {
    purposes: Array.isArray(data?.cameraPurposes) && data.cameraPurposes.length
      ? data.cameraPurposes.map((item) => item.name)
      : PURPOSES,
    cameraTypes: Array.isArray(data?.cameraTypes) && data.cameraTypes.length
      ? data.cameraTypes.map((item) => item.name)
      : CAMERA_TYPES,
    lenses: Array.isArray(data?.lenses) && data.lenses.length
      ? data.lenses.map((item) => item.name)
      : LENSES,
    pictures: Array.isArray(data?.pictures) && data.pictures.length
      ? data.pictures
      : PICTURES
  };
}

export default function CameraEditor({ camera, index, onChange, onDelete }) {
  const [refs, setRefs] = useState({
    purposes: PURPOSES,
    cameraTypes: CAMERA_TYPES,
    lenses: LENSES,
    pictures: PICTURES
  });

  useEffect(() => {
    let mounted = true;

    api.get('/api/reference')
      .then((data) => {
        if (!mounted) return;
        setRefs(normalizeReferenceData(data));
      })
      .catch(() => {
        if (!mounted) return;
        setRefs({
          purposes: PURPOSES,
          cameraTypes: CAMERA_TYPES,
          lenses: LENSES,
          pictures: PICTURES
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  const picture = useMemo(() => {
    return refs.pictures.find((item) => item.id === camera?.picture) || PICTURES.find((item) => item.id === camera?.picture) || refs.pictures[0] || PICTURES[0];
  }, [camera?.picture, refs.pictures]);

  if (!camera) {
    return (
      <Card sx={{ ...glass('#6ee7ff', 0.12), borderRadius: 3, background: 'linear-gradient(180deg, rgba(16,38,64,0.92) 0%, rgba(7,20,38,0.97) 100%)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>Camera Settings</Typography>
          <Typography color="text.secondary">Select a camera from the field or the list to edit its settings.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      <Card sx={{ ...glass('#6ee7ff', 0.12), borderRadius: 3, background: 'linear-gradient(180deg, rgba(16,38,64,0.92) 0%, rgba(7,20,38,0.97) 100%)' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Camera {index + 1}</Typography>
              <Typography color="text.secondary">Edit camera setup from here. The list below stays read-only.</Typography>
            </Box>
            <Button color="error" variant="outlined" startIcon={<DeleteOutlineRoundedIcon />} onClick={onDelete}>
              Delete
            </Button>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Purpose</InputLabel>
                <Select label="Purpose" value={camera.purpose} onChange={(e) => onChange('purpose', e.target.value)}>
                  {refs.purposes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Camera Type</InputLabel>
                <Select label="Camera Type" value={camera.cameraType} onChange={(e) => onChange('cameraType', e.target.value)}>
                  {refs.cameraTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Lens</InputLabel>
                <Select label="Lens" value={camera.lens} onChange={(e) => onChange('lens', e.target.value)}>
                  {refs.lenses.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Picture</InputLabel>
                <Select label="Picture" value={camera.picture} onChange={(e) => onChange('picture', e.target.value)}>
                  {refs.pictures.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Box
                  component="img"
                  src={picture?.file}
                  alt={picture?.name || 'Camera picture'}
                  sx={{
                    width: 78,
                    height: 78,
                    borderRadius: 2,
                    objectFit: 'contain',
                    p: 1,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transform: camera.mirror ? 'scaleX(-1)' : 'none'
                  }}
                />
                <Typography color="text.secondary">Pick the camera icon and setup style that should appear on the field.</Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ ...glass('#6ee7ff', 0.1), borderRadius: 3, background: 'linear-gradient(180deg, rgba(16,38,64,0.92) 0%, rgba(7,20,38,0.97) 100%)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Placement & Framing</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 0.75 }}>Angle</Typography>
              <Slider
                min={-180}
                max={180}
                step={1}
                value={Number(camera.angle) || 0}
                onChange={(_, value) => onChange('angle', value)}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}°`}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 0.75 }}>FOV</Typography>
              <Slider
                min={10}
                max={120}
                step={1}
                value={Number(camera.fov) || 50}
                onChange={(_, value) => onChange('fov', value)}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}°`}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="X Position %"
                value={Number(camera.x).toFixed(1)}
                onChange={(e) => onChange('x', Number(e.target.value))}
                inputProps={{ min: 0, max: 100, step: 0.5 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Y Position %"
                value={Number(camera.y).toFixed(1)}
                onChange={(e) => onChange('y', Number(e.target.value))}
                inputProps={{ min: 0, max: 100, step: 0.5 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControlLabel control={<Checkbox checked={!!camera.mirror} onChange={(e) => onChange('mirror', e.target.checked)} />} label="Mirror" />
                <FormControlLabel control={<Checkbox checked={!!camera.locked} onChange={(e) => onChange('locked', e.target.checked)} />} label="Lock position" />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ ...glass('#6ee7ff', 0.12), borderRadius: 3, background: 'linear-gradient(180deg, rgba(16,38,64,0.92) 0%, rgba(7,20,38,0.97) 100%)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Notes</Typography>
          <TextField
            multiline
            minRows={5}
            fullWidth
            value={camera.loc || ''}
            onChange={(e) => onChange('loc', e.target.value)}
            placeholder="Camera notes, cable route, mounting point, safety notes, lens plan..."
          />
        </CardContent>
      </Card>
    </Stack>
  );
}