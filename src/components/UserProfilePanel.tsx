"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Drawer,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Paper,
  Avatar,
  Chip,
  ListItemAvatar,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AccountCircle as AccountIcon,
  Add as AddIcon,
  Search as SearchIcon,
  BookmarkBorder as BookmarkIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { User, Organization } from "@/types";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";

interface UserProfilePanelProps {
  user: User;
  open: boolean;
  onClose: () => void;
  organizations?: Organization[];
  onCreateOrganization?: () => void;
  onSelectOrganization?: (organization: Organization) => void;
}

export default function UserProfilePanel({
  user,
  open,
  onClose,
  organizations = [],
  onCreateOrganization,
  onSelectOrganization,
}: UserProfilePanelProps) {
  // Helpers to safely derive display strings
  const getDisplayName = (u: User) => {
    const fn = (u.firstName || "").trim();
    const ln = (u.lastName || "").trim();
    if (fn || ln) return `${fn} ${ln}`.trim();
    if (u.username) return u.username;
    if (u.email) return u.email.split("@")[0];
    return "Użytkownik";
  };

  const getInitials = (u: User) => {
    const fn = (u.firstName || "").trim();
    const ln = (u.lastName || "").trim();
    if (fn || ln) {
      return `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase() || "U";
    }
    if (u.username && u.username.length > 0) {
      return u.username.substring(0, 2).toUpperCase();
    }
    if (u.email && u.email.length > 0) {
      return u.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };
  const [panelNotes, setPanelNotes] = useState<number>(0);
  const [panelOrgsCount, setPanelOrgsCount] = useState<number>(
    organizations.length
  );

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const res = await api.get("/notes/my");
        const arr = Array.isArray(res.data?.data) ? res.data.data : [];
        setPanelNotes(arr.length);
      } catch (err) {
        console.error("UserProfilePanel: Error fetching notes", err);
      }
    };
    loadNotes();
  }, []);

  // Dynamiczne odświeżanie liczby organizacji
  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const res = await api.get("/organizations/my");
        const arr = Array.isArray(res.data?.data) ? res.data.data : [];
        setPanelOrgsCount(arr.length);
      } catch (err) {
        console.error("UserProfilePanel: Error fetching organizations", err);
      }
    };
    loadOrgs();
  }, []);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400 },
          maxWidth: "100vw",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h6" component="h2">
            Profil użytkownika
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* User Avatar and Basic Info */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "bold",
              mx: "auto",
              mb: 2,
            }}
          >
            {getInitials(user)}
          </Box>
          <Typography variant="h6" gutterBottom>
            {getDisplayName(user)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            @{user.username || (user.email ? user.email.split("@")[0] : "user")}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Detailed Information */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Szczegóły konta
            </Typography>

            <List disablePadding>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Imię i nazwisko"
                  secondary={
                    user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : getDisplayName(user)
                  }
                />
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <EmailIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={user.email} />
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AccountIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Nazwa użytkownika"
                  secondary={user.username}
                />
              </ListItem>

              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CalendarIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Data rejestracji"
                  secondary={new Date(user.createdAt).toLocaleDateString(
                    "pl-PL",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
        {/* Organizations Section */}
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6">
                Organizacje ({panelOrgsCount})
              </Typography>
              {onCreateOrganization && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<BusinessIcon />}
                  onClick={onCreateOrganization}
                >
                  Nowa
                </Button>
              )}
            </Box>

            {organizations.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 3,
                  color: "text.secondary",
                }}
              >
                <BusinessIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" textAlign="center">
                  Brak organizacji
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {organizations.map((org, index) => (
                  <ListItem
                    key={org.id}
                    sx={{
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      mb: index < organizations.length - 1 ? 1 : 0,
                      border: 1,
                      borderColor: "grey.200",
                      px: 2,
                      py: 1,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "grey.100",
                      },
                    }}
                    onClick={() => {
                      if (onSelectOrganization) {
                        onSelectOrganization(org);
                        onClose();
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{ bgcolor: "primary.main", width: 32, height: 32 }}
                      >
                        <Typography fontSize="0.8rem">
                          {org.name?.[0]?.toUpperCase() || "?"}
                        </Typography>
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="subtitle2">
                            {org.name}
                          </Typography>
                          {org.ownerId === user?.id && (
                            <Chip
                              size="small"
                              label="Właściciel"
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: "0.6rem", height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        org.description ? (
                          <Typography variant="caption" color="text.secondary">
                            {org.description.length > 40
                              ? `${org.description.substring(0, 40)}...`
                              : org.description}
                          </Typography>
                        ) : null
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Statystyki
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                textAlign: "center",
              }}
            >
              <Box>
                <Typography variant="h4" color="primary.main">
                  {panelNotes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Notatki
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" color="secondary.main">
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(user.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dni w serwisie
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" color="success.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ukończone
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" color="warning.main">
                  0
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Zapisane
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Activity Section */}
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6">Aktywność</Typography>
              <TrendingIcon color="primary" />
            </Box>
            <Box textAlign="center" sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Zacznij tworzyć notatki, aby zobaczyć swoją aktywność!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Drawer>
  );
}
