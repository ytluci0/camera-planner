import React, { useEffect, useMemo, useRef, useState } from "react";
import { alpha } from "@mui/material/styles";
import { Box, Chip, Stack, Typography } from "@mui/material";
import SportField from "./SportField";
import { SPORT_PRESETS, pictureInfo } from "../utils/plannerConfig";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function getConeAngle(camera) {
  const angle = Number(camera.angle) || 0;
  return camera.mirror ? 180 - angle : angle;
}

export default function PlannerCanvas({
  sport = "football",
  cameras = [],
  selectedId,
  setSelectedId,
  setCameras,
  scale = 1
}) {
  const ref = useRef(null);
  const previewRef = useRef(null);
  const preset = SPORT_PRESETS[sport] || SPORT_PRESETS.football;
  const dragRef = useRef({
    id: null,
    pointerId: null,
    frame: null,
    lastClientX: 0,
    lastClientY: 0
  });
  const [dragPreview, setDragPreview] = useState(null);

  const aspectPadding = useMemo(
    () => `${(preset.height / preset.width) * 100}%`,
    [preset.height, preset.width]
  );
  const scalePct = Math.round((Number(scale) || 1) * 100);
  const stageScale = clamp(Number(scale) || 1, 0.75, 1.35);

  const eventToPercent = (clientX, clientY) => {
    const container = ref.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100, 0, 100)
    };
  };

  const flushDragFrame = () => {
    dragRef.current.frame = null;
    const point = eventToPercent(
      dragRef.current.lastClientX,
      dragRef.current.lastClientY
    );
    if (!point || !dragRef.current.id) return;
    previewRef.current = { id: dragRef.current.id, ...point };
    setDragPreview(previewRef.current);
  };

  const handleWindowPointerMove = (event) => {
    if (!dragRef.current.id) return;
    dragRef.current.lastClientX = event.clientX;
    dragRef.current.lastClientY = event.clientY;
    if (!dragRef.current.frame) {
      dragRef.current.frame = window.requestAnimationFrame(flushDragFrame);
    }
  };

  const stopDragging = (event) => {
    const { id } = dragRef.current;

    if (event && dragRef.current.id) {
      dragRef.current.lastClientX = event.clientX;
      dragRef.current.lastClientY = event.clientY;
    }

    if (dragRef.current.frame) {
      window.cancelAnimationFrame(dragRef.current.frame);
      dragRef.current.frame = null;
    }

    const finalPoint = id
      ? eventToPercent(
          dragRef.current.lastClientX,
          dragRef.current.lastClientY
        ) || previewRef.current
      : null;

    if (id && finalPoint) {
      setCameras((prev) =>
        prev.map((cam) =>
          cam.id === id && !cam.locked
            ? { ...cam, x: finalPoint.x, y: finalPoint.y }
            : cam
        )
      );
    }

    dragRef.current = {
      id: null,
      pointerId: null,
      frame: null,
      lastClientX: 0,
      lastClientY: 0
    };
    previewRef.current = null;
    setDragPreview(null);
    window.removeEventListener("pointermove", handleWindowPointerMove);
    window.removeEventListener("pointerup", stopDragging);
    window.removeEventListener("pointercancel", stopDragging);
  };

  const onPointerDown = (event, id) => {
    const cam = cameras.find((c) => c.id === id);
    if (!cam || cam.locked) return;
    event.preventDefault();
    setSelectedId(id);
    dragRef.current.id = id;
    dragRef.current.pointerId = event.pointerId;
    dragRef.current.lastClientX = event.clientX;
    dragRef.current.lastClientY = event.clientY;
    const point = eventToPercent(event.clientX, event.clientY);
    if (point) {
      previewRef.current = { id, ...point };
      setDragPreview(previewRef.current);
    }
    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true
    });
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
  };

  useEffect(
    () => () => {
      stopDragging();
    },
    []
  );

  const liveCameras = cameras.map((cam) =>
    dragPreview && dragPreview.id === cam.id
      ? { ...cam, x: dragPreview.x, y: dragPreview.y }
      : cam
  );

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1.25, flexWrap: "wrap" }}>
        <Chip
          label={`Sport: ${preset.name}`}
          color="primary"
          variant="outlined"
        />
        <Chip label={`${cameras.length} Cameras`} variant="outlined" />
        <Chip label={`Scale ${scalePct}%`} variant="outlined" />
      </Stack>

      <Box
        sx={{
          width: "100%",
          maxWidth: "1280px",
          mx: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 0.5
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: alpha("#061120", 0.88),
            border: `1px solid ${alpha("#ffffff", 0.12)}`,
            boxShadow: `0 18px 44px ${alpha("#000000", 0.28)}`
          }}
        >
          <Box sx={{ pt: aspectPadding }} />
          <Box
            ref={ref}
            sx={{
              position: "absolute",
              inset: 0,
              userSelect: "none",
              touchAction: "none",
              transform: `scale(${stageScale})`,
              transformOrigin: "center center"
            }}
          >
            <SportField sport={sport} />

            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${preset.width} ${preset.height}`}
              style={{ position: "absolute", inset: 0 }}
            >
              {liveCameras.map((cam) => {
                const x = (cam.x / 100) * preset.width;
                const y = (cam.y / 100) * preset.height;
                const angle = getConeAngle(cam);
                const fov = clamp(Number(cam.fov) || 50, 10, 120);
                const radius = preset.width * 0.19;
                const a = ((angle - fov / 2) * Math.PI) / 180;
                const b = ((angle + fov / 2) * Math.PI) / 180;
                const x1 = x + radius * Math.cos(a);
                const y1 = y + radius * Math.sin(a);
                const x2 = x + radius * Math.cos(b);
                const y2 = y + radius * Math.sin(b);
                const mid = (angle * Math.PI) / 180;
                const d = `M ${x} ${y} L ${x1} ${y1} Q ${x + radius * 0.92 * Math.cos(mid)} ${y + radius * 0.92 * Math.sin(mid)} ${x2} ${y2} Z`;
                return (
                  <path
                    key={`${cam.id}-cone`}
                    d={d}
                    fill="rgba(220,220,220,0.18)"
                    stroke="rgba(255,255,255,0.20)"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>

            {liveCameras.map((cam, index) => {
              const selected = cam.id === selectedId;
              const isDragging = dragPreview?.id === cam.id;
              const picture = pictureInfo(cam.picture);

              return (
                <Box
                  key={cam.id}
                  onPointerDown={(event) => onPointerDown(event, cam.id)}
                  onClick={() => setSelectedId(cam.id)}
                  sx={{
                    position: "absolute",
                    left: `${cam.x}%`,
                    top: `${cam.y}%`,
                    width: 56,
                    height: 56,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    cursor: cam.locked
                      ? "default"
                      : isDragging
                        ? "grabbing"
                        : "grab",
                    border: `2px solid ${selected ? "#6ee7ff" : "rgba(255,255,255,0.14)"}`,
                    background: alpha("#0b1220", selected ? 0.86 : 0.6),
                    boxShadow: selected
                      ? `0 0 32px ${alpha("#6ee7ff", 0.42)}`
                      : "0 10px 20px rgba(0,0,0,0.28)",
                    transition: isDragging
                      ? "none"
                      : "box-shadow 140ms ease, border-color 140ms ease",
                    willChange: "left, top",
                    zIndex: selected ? 3 : 2
                  }}
                >
                  <Box
                    component="img"
                    src={picture.file}
                    alt={picture.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      p: 0.75,
                      transform: cam.mirror ? "scaleX(-1)" : "none"
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: selected ? "primary.main" : "error.main",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      border: "2px solid rgba(255,255,255,0.92)"
                    }}
                  >
                    {index + 1}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Typography
        variant="caption"
        sx={{ display: "block", mt: 1.25, color: "text.secondary" }}
      >
        Drag cameras directly on the field. Releasing now keeps the camera in
        the dropped position.
      </Typography>
    </Box>
  );
}
