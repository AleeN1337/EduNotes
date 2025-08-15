"use client";
import React, { useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Chip,
  Tooltip,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Group as GroupIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

export interface OrganizationMember {
  user_id: string;
  email?: string;
  username?: string;
  role?: string;
}

interface UserManagementMenuProps {
  members: OrganizationMember[];
  currentUserId?: string | null;
  isOwner: boolean;
  onRemoveMember: (userId: string) => void;
  onRefreshMembers: () => void;
  loading?: boolean;
  userEmails?: Record<string, string>;
}

export default function UserManagementMenu({
  members,
  currentUserId,
  isOwner,
  onRemoveMember,
  onRefreshMembers,
  loading = false,
  userEmails = {},
}: UserManagementMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRemove = (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onRemoveMember(userId);
    handleClose();
  };

  const getInitials = (member: OrganizationMember) => {
    if (member.email) {
      return member.email.substring(0, 2).toUpperCase();
    }
    if (member.username) {
      return member.username.substring(0, 2).toUpperCase();
    }
    return member.user_id.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (member: OrganizationMember) => {
    console.log(`[Debug] Displaying member ${member.user_id}:`, {
      member,
      cachedEmail: userEmails[member.user_id],
    });

    // Priorytet: username jeśli dostępny
    if (member.username) {
      return `@${member.username}`;
    }
    // Następnie rzeczywisty email z member.email jeśli dostępny
    if (member.email) {
      return member.email;
    }
    // Następnie email z cache jeśli jest i nie jest placeholderem
    if (
      userEmails[member.user_id] &&
      !userEmails[member.user_id].startsWith("[ID:")
    ) {
      return userEmails[member.user_id];
    }

    // Placeholder lub fallback
    if (loading || userEmails[member.user_id]?.startsWith("[ID:")) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CircularProgress size={12} thickness={4} />
          <Typography
            component="span"
            sx={{ color: "text.secondary", fontStyle: "italic" }}
          >
            Ładowanie...
          </Typography>
        </Box>
      );
    }
    return (
      <Typography
        component="span"
        sx={{ color: "text.secondary", fontStyle: "italic" }}
      >
        Użytkownik #{member.user_id}
      </Typography>
    );
  };

  const getSortName = (member: OrganizationMember): string => {
    // Priorytet: username
    if (member.username) {
      return member.username.toLowerCase();
    }
    // Następnie email jeśli dostępny
    if (
      userEmails[member.user_id] &&
      !userEmails[member.user_id].startsWith("[ID:")
    ) {
      return userEmails[member.user_id].toLowerCase();
    }
    if (member.email) {
      return member.email.toLowerCase();
    }
    return `user_${member.user_id}`;
  };

  const sortedMembers = [...members].sort((a, b) => {
    // Właściciele na górze
    if (a.role === "owner" && b.role !== "owner") return -1;
    if (b.role === "owner" && a.role !== "owner") return 1;
    // Potem alfabetycznie po emailu/nazwie
    return getSortName(a).localeCompare(getSortName(b));
  });

  return (
    <>
      <Tooltip title="Zarządzaj użytkownikami">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          size="small"
          sx={{
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            },
          }}
        >
          <Badge
            badgeContent={members.length}
            color={members.length > 0 ? "secondary" : "default"}
            max={99}
          >
            <GroupIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: 400,
              maxWidth: "90vw",
              maxHeight: "70vh",
              overflow: "auto",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Członkowie organizacji
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                onRefreshMembers();
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={16} />
              ) : (
                <RefreshIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {members.length} {members.length === 1 ? "członek" : "członków"}
          </Typography>
        </Box>

        <Divider />

        {/* Members List */}
        {loading && members.length === 0 && (
          <MenuItem disabled>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 2,
              }}
            >
              <CircularProgress size={20} />
              <Typography>Ładowanie członków...</Typography>
            </Box>
          </MenuItem>
        )}

        {!loading && members.length === 0 && (
          <MenuItem disabled>
            <Typography color="text.secondary">
              Brak członków w organizacji
            </Typography>
          </MenuItem>
        )}

        {sortedMembers.map((member) => {
          const isCurrentUser =
            currentUserId && String(member.user_id) === String(currentUserId);
          const canRemove =
            isOwner && !isCurrentUser && member.role !== "owner";

          return (
            <MenuItem
              key={member.user_id}
              sx={{
                py: 1.5,
                px: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
              disabled={!canRemove}
            >
              {/* Avatar */}
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: "0.875rem",
                  bgcolor:
                    member.role === "owner" ? "primary.main" : "secondary.main",
                }}
              >
                {getInitials(member)}
              </Avatar>

              {/* User Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    noWrap
                    sx={{ flex: 1 }}
                  >
                    {getDisplayName(member)}
                  </Typography>
                  {member.role && (
                    <Chip
                      label={
                        member.role === "owner" ? "Właściciel" : member.role
                      }
                      size="small"
                      color={member.role === "owner" ? "primary" : "default"}
                      variant="outlined"
                      sx={{ fontSize: "0.6rem", height: 20 }}
                    />
                  )}
                  {isCurrentUser && (
                    <Chip
                      label="Ty"
                      size="small"
                      color="info"
                      variant="filled"
                      sx={{ fontSize: "0.6rem", height: 20 }}
                    />
                  )}
                </Box>
                {member.username && member.username !== member.email && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    @{member.username}
                  </Typography>
                )}
              </Box>

              {/* Remove Button */}
              {canRemove && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => handleRemove(member.user_id, e)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "error.light",
                      color: "error.contrastText",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </MenuItem>
          );
        })}

        {!isOwner &&
          members.length > 0 && [
            <Divider key="owner-warning-divider" />,
            <Box key="owner-warning-box" sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Tylko właściciel może zarządzać członkami organizacji
              </Typography>
            </Box>,
          ]}
      </Menu>
    </>
  );
}
