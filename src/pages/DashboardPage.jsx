import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { alpha } from "@mui/material/styles";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PlannerCanvas from "../components/PlannerCanvas";
import CamerasTable from "../components/CamerasTable";
import CameraEditor from "../components/CameraEditor";
import { createCamera, SPORT_PRESETS } from "../utils/plannerConfig";
import { glass } from "../theme";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { key: "editor", path: "/editor", label: "Editor" },
  { key: "database", path: "/admin/database", label: "Database" },
  { key: "projects", path: "/projects", label: "Projects" }
];

const starter = {
  id: null,
  name: "New Project",
  event_date: "",
  event_time: "",
  sport_type: "football",
  pitch_scale: 1,
  cameras: [createCamera(0)],
  notes: "",
  active_levels: []
};

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const panelSx = {
  ...glass("#6ee7ff", 0.12),
  borderRadius: "16px",
  background:
    "linear-gradient(180deg, rgba(16,38,64,0.92) 0%, rgba(7,20,38,0.97) 100%)",
  border: "1px solid rgba(255,255,255,0.1)"
};

function formatEventDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function ExportOverviewTable({ cameras = [] }) {
  return (
    <Box
      component="table"
      sx={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        overflow: "hidden",
        border: `1px solid ${alpha("#ffffff", 0.12)}`,
        borderRadius: "14px"
      }}
    >
      <Box component="thead" sx={{ backgroundColor: alpha("#ffffff", 0.03) }}>
        <Box component="tr">
          {[
            "#",
            "Purpose",
            "Camera Type",
            "Lens",
            "Picture",
            "Notes",
            "Angle",
            "FOV"
          ].map((label) => (
            <Box
              key={label}
              component="th"
              sx={{
                textAlign: "left",
                px: 1.5,
                py: 1.2,
                fontSize: 13,
                fontWeight: 800,
                color: "rgba(255,255,255,0.86)",
                borderBottom: `1px solid ${alpha("#ffffff", 0.1)}`
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
      </Box>
      <Box component="tbody">
        {cameras.map((cam, index) => (
          <Box
            key={cam.id || index}
            component="tr"
            sx={{
              "&:nth-of-type(odd)": { backgroundColor: alpha("#ffffff", 0.02) }
            }}
          >
            <Box component="td" sx={{ px: 1.5, py: 1.1, fontSize: 13 }}>
              {index + 1}
            </Box>
            <Box component="td" sx={{ px: 1.5, py: 1.1, fontSize: 13 }}>
              {cam.purpose || "—"}
            </Box>
            <Box component="td" sx={{ px: 1.5, py: 1.1, fontSize: 13 }}>
              {cam.cameraType || "—"}
            </Box>
            <Box component="td" sx={{ px: 1.5, py: 1.1, fontSize: 13 }}>
              {cam.lens || "—"}
            </Box>
            <Box component="td" sx={{ px: 1.5, py: 1.1, fontSize: 13 }}>
              {cam.picture || "—"}
            </Box>
            <Box
              component="td"
              sx={{
                px: 1.5,
                py: 1.1,
                fontSize: 13,
                maxWidth: 260,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {cam.loc || cam.notes || "—"}
            </Box>
            <Box
              component="td"
              sx={{ px: 1.5, py: 1.1, fontSize: 13 }}
            >{`${Number(cam.angle) || 0}°`}</Box>
            <Box
              component="td"
              sx={{ px: 1.5, py: 1.1, fontSize: 13 }}
            >{`${Number(cam.fov) || 0}°`}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function DashboardPage({
  pathname = "/editor",
  search = "",
  onNavigate = () => {}
}) {
  const { user, logout, has } = useAuth();
  const stageRef = useRef(null);
  const exportRef = useRef(null);
  const [project, setProject] = useState(starter);
  const [selectedId, setSelectedId] = useState(starter.cameras[0].id);
  const [status, setStatus] = useState("Starter loaded.");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const titleLine = useMemo(
    () =>
      `${project.name || "Untitled Project"} • ${SPORT_PRESETS[project.sport_type]?.name || "Football"}`,
    [project.name, project.sport_type]
  );
  const selectedCamera = useMemo(
    () => project.cameras.find((cam) => cam.id === selectedId) || null,
    [project.cameras, selectedId]
  );
  const selectedIndex = useMemo(
    () => project.cameras.findIndex((cam) => cam.id === selectedId),
    [project.cameras, selectedId]
  );
  const pitchLabel = SPORT_PRESETS[project.sport_type]?.name || "Football";

  useEffect(() => {
    const projectId = new URLSearchParams(search).get("projectId");
    if (!projectId) return;

    const loadProjectById = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.get(`/api/projects/${projectId}`);
        const loaded = data.project;
        const nextCameras = loaded.payload_json?.cameras?.length
          ? loaded.payload_json.cameras
          : [createCamera(0)];
        setProject({
          id: loaded.id,
          name: loaded.name,
          event_date: loaded.event_date || "",
          event_time: loaded.event_time || "",
          sport_type:
            loaded.payload_json?.sport_type || loaded.sport_type || "football",
          pitch_scale: loaded.payload_json?.pitch_scale || 1,
          cameras: nextCameras,
          notes: loaded.payload_json?.notes || "",
          active_levels: loaded.payload_json?.active_levels || []
        });
        setSelectedId(nextCameras[0]?.id || null);
        setStatus(`Loaded project: ${loaded.name}`);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProjectById();
  }, [search]);

  const setCameras = (updater) => {
    setProject((prev) => {
      const cameras =
        typeof updater === "function" ? updater(prev.cameras) : updater;
      return { ...prev, cameras };
    });
  };

  const updateCamera = (id, field, value) => {
    setCameras((prev) =>
      prev.map((cam) => {
        if (cam.id !== id) return cam;
        const nextValue = ["x", "y"].includes(field)
          ? Math.max(0, Math.min(100, Number(value) || 0))
          : value;
        return { ...cam, [field]: nextValue };
      })
    );
  };

  const addCamera = () => {
    const newCamera = createCamera(project.cameras.length);
    setCameras((prev) => [...prev, newCamera]);
    setSelectedId(newCamera.id);
    setStatus("Camera added.");
  };

  const removeCamera = (id) => {
    setProject((prev) => {
      const cameras = prev.cameras.filter((cam) => cam.id !== id);
      const nextCameras = cameras.length ? cameras : [createCamera(0)];
      const nextSelected =
        nextCameras.find((cam) => cam.id !== id)?.id || nextCameras[0].id;
      setSelectedId(nextSelected);
      return { ...prev, cameras: nextCameras };
    });
    setStatus("Camera removed.");
  };

  const handleNewProject = () => {
    const nextStarter = {
      ...starter,
      cameras: [createCamera(0)]
    };
    setProject(nextStarter);
    setSelectedId(nextStarter.cameras[0].id);
    setError("");
    setStatus("New project ready.");
    onNavigate("/editor");
  };

  const saveProject = async () => {
    setLoading(true);
    setError("");
    try {
      const body = {
        ...project,
        payload_json: {
          sport_type: project.sport_type,
          pitch_scale: project.pitch_scale,
          cameras: project.cameras,
          notes: project.notes,
          active_levels: project.active_levels
        }
      };
      const data = project.id
        ? await api.put(`/api/projects/${project.id}`, body)
        : await api.post("/api/projects", body);

      const savedId = data.project.id;
      setProject((prev) => ({ ...prev, id: savedId }));
      setStatus(`Saved project #${savedId}`);
      if (!project.id) {
        onNavigate(`/editor?projectId=${savedId}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLatest = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/projects?limit=1");
      const latest = data.projects?.[0];
      if (!latest) {
        setStatus("No projects found in database yet.");
        return;
      }
      const nextCameras = latest.payload_json?.cameras || [createCamera(0)];
      setProject({
        id: latest.id,
        name: latest.name,
        event_date: latest.event_date || "",
        event_time: latest.event_time || "",
        sport_type:
          latest.payload_json?.sport_type || latest.sport_type || "football",
        pitch_scale: latest.payload_json?.pitch_scale || 1,
        cameras: nextCameras,
        notes: latest.payload_json?.notes || "",
        active_levels: latest.payload_json?.active_levels || []
      });
      setSelectedId(nextCameras[0]?.id || null);
      setStatus(`Loaded latest project: ${latest.name}`);
      onNavigate(`/editor?projectId=${latest.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportPng = async () => {
    const node = stageRef.current;
    if (!node) return;
    const canvas = await html2canvas(node, {
      backgroundColor: "#07111f",
      scale: 2
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `${project.name || "camera-plan"}.png`);
    });
    setStatus("PNG exported.");
  };

  const exportPdf = async () => {
    const node = exportRef.current;
    if (!node) return;

    const canvas = await html2canvas(node, {
      backgroundColor: "#07111f",
      scale: 2,
      useCORS: true,
      windowWidth: node.scrollWidth,
      windowHeight: node.scrollHeight
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 6;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(
      imgData,
      "PNG",
      margin,
      position,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );
    heightLeft -= usableHeight;

    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      heightLeft -= usableHeight;
    }

    pdf.save(`${project.name || "camera-plan"}.pdf`);
    setStatus("PDF exported.");
  };

  const exportHtml = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${project.name}</title></head><body><pre>${JSON.stringify(project, null, 2)}</pre></body></html>`;
    downloadBlob(
      new Blob([html], { type: "text/html;charset=utf-8" }),
      `${project.name || "camera-plan"}.html`
    );
    setStatus("HTML snapshot exported.");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(110,231,255,0.12), transparent 24%), linear-gradient(180deg, #07111f 0%, #030712 100%)"
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2.25,
          borderBottom: `1px solid ${alpha("#ffffff", 0.08)}`,
          backdropFilter: "blur(14px)"
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: 30, md: 42 },
                lineHeight: 1.05,
                fontWeight: 800
              }}
            >
              Camera Planner
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {titleLine}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}
          >
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.key}
                variant={pathname === item.path ? "contained" : "outlined"}
                startIcon={item.key === "editor" ? <TuneRoundedIcon /> : null}
                onClick={() => onNavigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="outlined"
              onClick={handleNewProject}
              disabled={loading}
            >
              New project
            </Button>
            <Button
              startIcon={<RestoreRoundedIcon />}
              variant="outlined"
              onClick={loadLatest}
              disabled={loading}
            >
              Load latest
            </Button>
            <Button
              startIcon={<SaveRoundedIcon />}
              variant="contained"
              onClick={saveProject}
              disabled={loading || !has("projects:edit")}
            >
              Save project
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              sx={{ px: 1.6 }}
            >{`${user?.name || "User"} • ${user?.role_name || "viewer"}`}</Button>
            <Button
              startIcon={<LogoutRoundedIcon />}
              variant="outlined"
              color="inherit"
              onClick={logout}
            >
              Logout
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "1920px", mx: "auto" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              xl: "minmax(0, 1.75fr) minmax(420px, 0.95fr)"
            },
            gap: 2,
            alignItems: "start"
          }}
        >
          <Stack spacing={2.5}>
            <Card sx={{ ...panelSx, overflow: "hidden" }}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 } }} ref={stageRef}>
                <PlannerCanvas
                  sport={project.sport_type}
                  cameras={project.cameras}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  setCameras={setCameras}
                  scale={project.pitch_scale}
                  activeLevels={project.active_levels}
                />
              </CardContent>
            </Card>

            <Card sx={panelSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Typography variant="h6" sx={{ mb: 1.25 }}>
                  Cameras Overview
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Click a row to select a camera. Editing stays on the right
                  inside the Editor panel.
                </Typography>
                <CamerasTable
                  cameras={project.cameras}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                />
              </CardContent>
            </Card>
          </Stack>

          <Stack spacing={2.5}>
            <Card sx={panelSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    letterSpacing: "0.16em",
                    fontWeight: 800
                  }}
                >
                  Project Setup
                </Typography>
                <Grid container spacing={1.75} sx={{ mt: 0.25 }}>
                  <Grid item xs={12}>
                    <TextField
                      label="Project Name"
                      fullWidth
                      value={project.name}
                      onChange={(e) =>
                        setProject((prev) => ({
                          ...prev,
                          name: e.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      type="date"
                      label="Event Date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={project.event_date}
                      onChange={(e) =>
                        setProject((prev) => ({
                          ...prev,
                          event_date: e.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      type="time"
                      label="Event Time"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={project.event_time}
                      onChange={(e) =>
                        setProject((prev) => ({
                          ...prev,
                          event_time: e.target.value
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <FormControl fullWidth>
                      <InputLabel>Pitch Type</InputLabel>
                      <Select
                        label="Pitch Type"
                        value={project.sport_type}
                        onChange={(e) =>
                          setProject((prev) => ({
                            ...prev,
                            sport_type: e.target.value
                          }))
                        }
                      >
                        {Object.values(SPORT_PRESETS).map((sport) => (
                          <MenuItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Typography variant="body2" sx={{ mb: 0.75 }}>
                      Pitch Scale
                    </Typography>
                    <Slider
                      min={0.75}
                      max={1.35}
                      step={0.01}
                      value={project.pitch_scale}
                      onChange={(_, value) =>
                        setProject((prev) => ({ ...prev, pitch_scale: value }))
                      }
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) =>
                        `${Math.round(value * 100)}%`
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Levels Area
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {[1, 2, 3].map((level) => {
                        const active = project.active_levels.includes(level);
                        return (
                          <Button
                            key={level}
                            variant={active ? "contained" : "outlined"}
                            size="small"
                            onClick={() =>
                              setProject((prev) => ({
                                ...prev,
                                active_levels: prev.active_levels.includes(
                                  level
                                )
                                  ? prev.active_levels.filter(
                                      (item) => item !== level
                                    )
                                  : [...prev.active_levels, level].sort(
                                      (a, b) => a - b
                                    )
                              }))
                            }
                          >
                            {`Level ${level}`}
                          </Button>
                        );
                      })}
                    </Stack>
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                  <Button
                    startIcon={<AddRoundedIcon />}
                    variant="outlined"
                    onClick={addCamera}
                    disabled={!has("projects:edit")}
                  >
                    Add camera
                  </Button>
                  <Button
                    startIcon={<ImageRoundedIcon />}
                    variant="outlined"
                    onClick={exportPng}
                  >
                    Export PNG
                  </Button>
                  <Button
                    startIcon={<PictureAsPdfRoundedIcon />}
                    variant="outlined"
                    onClick={exportPdf}
                  >
                    Export PDF
                  </Button>
                  <Button
                    startIcon={<ShareRoundedIcon />}
                    variant="outlined"
                    onClick={exportHtml}
                  >
                    Share HTML
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <CameraEditor
              camera={selectedCamera}
              index={selectedIndex}
              onChange={(field, value) =>
                updateCamera(selectedId, field, value)
              }
              onDelete={() => removeCamera(selectedId)}
            />

            <Card
              sx={{
                ...panelSx,
                background:
                  "linear-gradient(180deg, rgba(18,40,66,0.88) 0%, rgba(10,21,38,0.96) 100%)"
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    letterSpacing: "0.16em",
                    fontWeight: 800
                  }}
                >
                  Project Notes
                </Typography>
                <TextField
                  multiline
                  minRows={4}
                  fullWidth
                  value={project.notes}
                  onChange={(e) =>
                    setProject((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Match notes, cable path notes, setup reminders, special production instructions..."
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Alert severity="info">{status}</Alert>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          position: "fixed",
          left: -10000,
          top: 0,
          width: 1800,
          pointerEvents: "none"
        }}
      >
        <Box
          ref={exportRef}
          sx={{
            width: 1800,
            p: 3,
            boxSizing: "border-box",
            color: "#ffffff",
            bgcolor: "#07111f"
          }}
        >
          <Typography sx={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>
            Camera Planner
          </Typography>
          <Typography
            sx={{ mt: 0.5, color: "rgba(255,255,255,0.68)", fontSize: 16 }}
          >
            {project.name || "Untitled Project"}
          </Typography>

          <Box
            sx={{
              mt: 2.5,
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 1.5
            }}
          >
            {[
              ["Pitch Type", pitchLabel],
              ["Number of Cameras", String(project.cameras.length)],
              ["Project Name", project.name || "—"],
              ["Event Date", formatEventDate(project.event_date)],
              ["Event Time", project.event_time || "—"]
            ].map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  border: `1px solid ${alpha("#ffffff", 0.1)}`,
                  borderRadius: "14px",
                  p: 1.5,
                  background:
                    "linear-gradient(180deg, rgba(16,38,64,0.92) 0%, rgba(7,20,38,0.97) 100%)"
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#6ee7ff"
                  }}
                >
                  {label}
                </Typography>
                <Typography sx={{ mt: 0.65, fontSize: 20, fontWeight: 700 }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              mt: 2.5,
              border: `1px solid ${alpha("#ffffff", 0.1)}`,
              borderRadius: "16px",
              p: 2,
              background:
                "linear-gradient(180deg, rgba(16,38,64,0.92) 0%, rgba(7,20,38,0.97) 100%)"
            }}
          >
            <PlannerCanvas
              sport={project.sport_type}
              cameras={project.cameras}
              selectedId={selectedId}
              setSelectedId={() => {}}
              setCameras={() => {}}
              scale={project.pitch_scale}
              readOnly
              showScaleChip={false}
              helperText={false}
              activeLevels={project.active_levels}
            />
          </Box>

          <Box sx={{ mt: 2.5 }}>
            <Typography sx={{ fontSize: 26, fontWeight: 800, mb: 1.5 }}>
              Cameras Overview
            </Typography>
            <ExportOverviewTable cameras={project.cameras} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
