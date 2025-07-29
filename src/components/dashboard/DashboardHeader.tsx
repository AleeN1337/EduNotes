"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { User } from "@/types";

interface DashboardHeaderProps {
  user: User;
  onProfileClick: () => void;
  onLogout: () => void;
}

export default function DashboardHeader({
  user,
  onProfileClick,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <AppBar
      position="static"
      sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
        >
          📚 EduNotes
        </Typography>
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 2,
            "& .MuiButton-root": {
              borderRadius: 2,
              px: 2,
              py: 1,
              textTransform: "none",
              fontWeight: 500,
            },
          }}
        >
          <Button
            color="inherit"
            onClick={onProfileClick}
            startIcon={<PersonIcon />}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                transform: "translateY(-1px)",
                transition: "all 0.2s ease",
              },
            }}
          >
            Profil
          </Button>
          <Button
            color="inherit"
            startIcon={<NotificationsIcon />}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                transform: "translateY(-1px)",
                transition: "all 0.2s ease",
              },
            }}
          >
            Powiadomienia
          </Button>
          <Button
            color="inherit"
            onClick={onLogout}
            startIcon={<LogoutIcon />}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                color: "#ff6b6b",
                transform: "translateY(-1px)",
                transition: "all 0.2s ease",
              },
            }}
          >
            Wyloguj
          </Button>
        </Box>

        {/* Mobile menu - only icons */}
        <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={onProfileClick}
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.15)",
              },
            }}
          >
            <PersonIcon />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.15)",
              },
            }}
          >
            <NotificationsIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={onLogout}
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                color: "#ff6b6b",
              },
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
