import React, { useMemo, useRef, useState } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SportField from './SportField';
import { pictureInfo, SPORT_PRESETS } from '../utils/plannerConfig';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const normDeg = (d) => {
  let x = d % 360;
  if (x > 180) x -= 360;
  if (x <= -180) x += 360;
  return x;
};

function getConeAngle(cam) {
  const ang = Number(cam.angle) || 0;
  return normDeg(cam.mirror ? 180 - ang : ang);
}

export default function PlannerCanvas({ sport, cameras, selectedId, setSelectedId, setCameras, scale = 1 }) {
  const [dragId, setDragId] = useState(null);
  const ref = useRef(null);
  const preset = SPORT_PRESETS[sport] || SPORT_PRESETS.football;

  const aspectPadding = useMemo(() => `${(preset.height / preset.width) * 100}%`, [preset.height, preset.width]);

  const moveCamera = (id, clientX, clientY) => {
    const container = ref.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    setCameras((prev) => prev.map((cam) => (cam.id === id && !cam.locked ? { ...cam, x, y } : cam)));
  };

  const onPointerDown = (event, id) => {
    const cam = cameras.find((c) => c.id === id);
    if (!cam || cam.locked) return;
    setSelectedId(id);
    setDragId(id);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!dragId) return;
    moveCamera(dragId, event.clientX, event.clientY);
  };

  const onPointerUp = () => setDragId(null);

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
        <Chip label={`Sport: ${preset.name}`} color="primary" variant="outlined" />
        <Chip label={`${cameras.length} Cameras`} variant="outlined" />
        <Chip label={`Scale ${Math.round(scale * 100)}%`} variant="outlined" />
      </Stack>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: alpha('#03101f', 0.7),
          border: `1px solid ${alpha('#ffffff', 0.12)}`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }}
      >
        <Box sx={{ pt: aspectPadding }} />
        <Box
          ref={ref}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          sx={{ position: 'absolute', inset: 0, userSelect: 'none' }}
        >
          <SportField sport={sport} />

          <svg width="100%" height="100%" viewBox={`0 0 ${preset.width} ${preset.height}`} style={{ position: 'absolute', inset: 0 }}>
            {cameras.map((cam) => {
              const x = (cam.x / 100) * preset.width;
              const y = (cam.y / 100) * preset.height;
              const angle = getConeAngle(cam);
              const fov = clamp(Number(cam.fov) || 50, 10, 120);
              const radius = preset.width * 0.18;
              const a = ((angle - fov / 2) * Math.PI) / 180;
              const b = ((angle + fov / 2) * Math.PI) / 180;
              const x1 = x + radius * Math.cos(a);
              const y1 = y + radius * Math.sin(a);
              const x2 = x + radius * Math.cos(b);
              const y2 = y + radius * Math.sin(b);
              const mid = (angle * Math.PI) / 180;
              const d = `M ${x} ${y} L ${x1} ${y1} Q ${x + radius * 0.9 * Math.cos(mid)} ${y + radius * 0.9 * Math.sin(mid)} ${x2} ${y2} Z`;
              return <path key={`${cam.id}-cone`} d={d} fill="rgba(220,220,220,0.22)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />;
            })}
          </svg>

          {cameras.map((cam, index) => {
            const picture = pictureInfo(cam.picture);
            const selected = cam.id === selectedId;
            return (
              <Box
                key={cam.id}
                onPointerDown={(e) => onPointerDown(e, cam.id)}
                onClick={() => setSelectedId(cam.id)}
                sx={{
                  position: 'absolute',
                  left: `${cam.x}%`,
                  top: `${cam.y}%`,
                  width: 64,
                  height: 64,
                  transform: 'translate(-50%, -50%)',
                  cursor: cam.locked ? 'not-allowed' : 'grab',
                  borderRadius: '50%',
                  border: `2px solid ${selected ? '#6ee7ff' : 'rgba(255,255,255,0.15)'}`,
                  background: alpha('#0b1220', 0.5),
                  boxShadow: selected ? `0 0 28px ${alpha('#6ee7ff', 0.45)}` : 'none'
                }}
              >
                <Box
                  component="img"
                  src={picture.file}
                  alt={picture.name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    p: 0.75,
                    transform: cam.mirror ? 'scaleX(-1)' : 'none'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: selected ? 'primary.main' : 'error.main',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    border: '2px solid rgba(255,255,255,0.9)'
                  }}
                >
                  {index + 1}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
        Drag cameras directly on the field. Locks, mirror, FOV, and angle are controlled from the table on the right.
      </Typography>
    </Box>
  );
}
