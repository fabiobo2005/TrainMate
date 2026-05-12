import { useState } from "react";
import {
  AppBar, Toolbar, IconButton, Typography, Drawer, List,
  ListItemButton, ListItemIcon, ListItemText, Box, Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import InsightsIcon from "@mui/icons-material/Insights";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useNavigate } from "react-router-dom";

const items = [
  { label: "Início", path: "/", icon: <HomeIcon /> },
  { label: "Alunos", path: "/students", icon: <PeopleIcon /> },
  { label: "Treino (Força)", path: "/train", icon: <FitnessCenterIcon /> },
  { label: "Cardio", path: "/cardio", icon: <DirectionsBikeIcon /> },
  { label: "Progresso", path: "/progress", icon: <InsightsIcon /> },
  { label: "Planos de Treino", path: "/plans", icon: <AssignmentIcon /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>TrainMate</Typography>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setOpen(false)}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Menu</Typography>
          </Box>
          <Divider />
          <List>
            {items.map((it) => (
              <ListItemButton key={it.path} onClick={() => nav(it.path)}>
                <ListItemIcon>{it.icon}</ListItemIcon>
                <ListItemText primary={it.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
