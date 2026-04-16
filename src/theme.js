import { alpha, createTheme } from "@mui/material/styles";

export const glass = (color, opacity = 0.16) => ({
  background: `linear-gradient(180deg, ${alpha(color, opacity + 0.06)} 0%, ${alpha("#0b1120", opacity)} 100%)`,
  border: `1px solid ${alpha("#ffffff", 0.12)}`,
  backdropFilter: "blur(18px)",
  boxShadow: `0 12px 40px ${alpha("#000000", 0.22)}`
});

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6ee7ff" },
    secondary: { main: "#8b5cf6" },
    success: { main: "#22c55e" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
    background: {
      default: "#07111f",
      paper: "#101b2e"
    }
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: ["Inter", "Segoe UI", "Roboto", "Arial", "sans-serif"].join(
      ","
    ),
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    }
  }
});
