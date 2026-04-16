import React from 'react';
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { pictureInfo } from '../utils/plannerConfig';

export default function CamerasTable({ cameras, selectedId, setSelectedId }) {
  return (
    <TableContainer
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha('#b8d4ff', 0.12)}`,
        overflow: 'hidden'
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {['#', 'Purpose', 'Camera Type', 'Lens', 'Picture', 'Notes', 'Angle', 'FOV', 'Mirror', 'Lock'].map((label) => (
              <TableCell key={label} sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {cameras.map((cam, index) => {
            const picture = pictureInfo(cam.picture);
            return (
              <TableRow
                key={cam.id}
                hover
                selected={cam.id === selectedId}
                onClick={() => setSelectedId(cam.id)}
                sx={{
                  cursor: 'pointer',
                  '&.Mui-selected': {
                    backgroundColor: alpha('#7dd3fc', 0.12)
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: alpha('#7dd3fc', 0.16)
                  }
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{cam.purpose}</TableCell>
                <TableCell>{cam.cameraType}</TableCell>
                <TableCell>{cam.lens}</TableCell>
                <TableCell>{picture.name}</TableCell>
                <TableCell sx={{ maxWidth: 260 }}>
                  <Tooltip title={cam.loc || '—'}>
                    <Box
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: cam.loc ? 'text.primary' : 'text.secondary'
                      }}
                    >
                      {cam.loc || '—'}
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell>{Math.round(Number(cam.angle) || 0)}°</TableCell>
                <TableCell>{Math.round(Number(cam.fov) || 50)}°</TableCell>
                <TableCell>
                  <Chip size="small" label={cam.mirror ? 'On' : 'Off'} variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={cam.locked ? 'Locked' : 'Free'}
                    color={cam.locked ? 'warning' : 'success'}
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {!cameras.length && (
        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No cameras yet.</Box>
      )}
    </TableContainer>
  );
}
