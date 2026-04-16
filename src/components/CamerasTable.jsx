import React from 'react';
import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { pictureInfo } from '../utils/plannerConfig';

export default function CamerasTable({ cameras = [], selectedId, setSelectedId }) {
  return (
    <TableContainer sx={{ borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <Table size="small" sx={{ minWidth: 980 }}>
        <TableHead>
          <TableRow>
            {['#', 'Purpose', 'Camera Type', 'Lens', 'Picture', 'Notes', 'Angle', 'FOV', 'Mirror', 'Lock'].map((label) => (
              <TableCell key={label} sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {cameras.map((cam, index) => {
            const picture = pictureInfo(cam.picture);
            const selected = cam.id === selectedId;
            return (
              <TableRow
                key={cam.id}
                hover
                selected={selected}
                onClick={() => setSelectedId(cam.id)}
                sx={{
                  cursor: 'pointer',
                  '& td': {
                    py: 1.4,
                    borderBottom: '1px solid rgba(255,255,255,0.06)'
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(110,231,255,0.10)'
                  }
                }}
              >
                <TableCell sx={{ fontWeight: 700 }}>{index + 1}</TableCell>
                <TableCell>{cam.purpose}</TableCell>
                <TableCell>{cam.cameraType}</TableCell>
                <TableCell>{cam.lens}</TableCell>
                <TableCell>{picture.name}</TableCell>
                <TableCell sx={{ maxWidth: 280 }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {cam.loc || '—'}
                  </Typography>
                </TableCell>
                <TableCell>{Number(cam.angle) || 0}°</TableCell>
                <TableCell>{Number(cam.fov) || 0}°</TableCell>
                <TableCell>
                  <Chip size="small" label={cam.mirror ? 'On' : 'Off'} color={cam.mirror ? 'primary' : 'default'} variant={cam.mirror ? 'filled' : 'outlined'} />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={cam.locked ? 'Locked' : 'Free'} color={cam.locked ? 'warning' : 'success'} variant="outlined" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {!cameras.length && <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No cameras yet.</Box>}
    </TableContainer>
  );
}
