import React from 'react';
import {
  Box,
  Checkbox,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import { CAMERA_TYPES, LENSES, PICTURES, PURPOSES } from '../utils/plannerConfig';

export default function CamerasTable({ cameras, selectedId, setSelectedId, setCameras }) {
  const update = (id, field, value) => {
    setCameras((prev) => prev.map((cam) => (cam.id === id ? { ...cam, [field]: value } : cam)));
  };

  const remove = (id) => {
    setCameras((prev) => prev.filter((cam) => cam.id !== id));
  };

  return (
    <TableContainer sx={{ maxHeight: 760 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {['#', 'Purpose', 'Camera Type', 'Lens', 'Picture', 'Mirror', 'Location / Notes', 'Operator', 'CCU', 'Channel', 'Angle', 'FOV', 'Lock', 'Del'].map((label) => (
              <TableCell key={label}>{label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {cameras.map((cam, index) => (
            <TableRow
              key={cam.id}
              hover
              selected={cam.id === selectedId}
              onClick={() => setSelectedId(cam.id)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Select size="small" fullWidth value={cam.purpose} onChange={(e) => update(cam.id, 'purpose', e.target.value)}>
                  {PURPOSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </TableCell>
              <TableCell>
                <Select size="small" fullWidth value={cam.cameraType} onChange={(e) => update(cam.id, 'cameraType', e.target.value)}>
                  {CAMERA_TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </TableCell>
              <TableCell>
                <Select size="small" fullWidth value={cam.lens} onChange={(e) => update(cam.id, 'lens', e.target.value)}>
                  {LENSES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </TableCell>
              <TableCell>
                <Select size="small" fullWidth value={cam.picture} onChange={(e) => update(cam.id, 'picture', e.target.value)}>
                  {PICTURES.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                </Select>
              </TableCell>
              <TableCell>
                <Tooltip title="Mirror icon left/right">
                  <IconButton color={cam.mirror ? 'primary' : 'default'} onClick={(e) => { e.stopPropagation(); update(cam.id, 'mirror', !cam.mirror); }}>
                    <FlipRoundedIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell><TextField size="small" value={cam.loc} onChange={(e) => update(cam.id, 'loc', e.target.value)} /></TableCell>
              <TableCell><TextField size="small" value={cam.operator} onChange={(e) => update(cam.id, 'operator', e.target.value)} /></TableCell>
              <TableCell><TextField size="small" value={cam.ccu} onChange={(e) => update(cam.id, 'ccu', e.target.value)} /></TableCell>
              <TableCell><TextField size="small" value={cam.channel} onChange={(e) => update(cam.id, 'channel', e.target.value)} /></TableCell>
              <TableCell><TextField size="small" type="number" value={cam.angle} onChange={(e) => update(cam.id, 'angle', Number(e.target.value))} inputProps={{ min: -180, max: 180, step: 5 }} /></TableCell>
              <TableCell><TextField size="small" type="number" value={cam.fov} onChange={(e) => update(cam.id, 'fov', Number(e.target.value))} inputProps={{ min: 10, max: 120, step: 5 }} /></TableCell>
              <TableCell><Checkbox checked={cam.locked} onChange={(e) => update(cam.id, 'locked', e.target.checked)} /></TableCell>
              <TableCell>
                <Stack direction="row">
                  <IconButton color="error" onClick={(e) => { e.stopPropagation(); remove(cam.id); }}>
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!cameras.length && <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No cameras yet.</Box>}
    </TableContainer>
  );
}
