"use client";
import React from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Tooltip,
  Avatar,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";

export interface OrganizationMember {
  user_id: string;
  email?: string;
  username?: string;
  role?: string;
}

interface MemberMenuProps {
  members: OrganizationMember[];
  currentUserId?: string | null;
  onRemove: (userId: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export default function MemberMenu({
  members,
  currentUserId,
  onRemove,
  onRefresh,
  loading,
}: MemberMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const sorted = [...members].sort((a, b) =>
    a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0
  );

  const getInitials = (m: OrganizationMember) => {
    const base = m.username || m.email || m.user_id;
    return base?.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Tooltip title="Członkowie organizacji">
        <IconButton
          color="inherit"
          size="small"
          onClick={handleOpen}
          sx={{ ml: 1 }}
        >
          <Badge
            badgeContent={members.length}
            color={members.length ? "secondary" : "default"}
          >
            <GroupIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{ paper: { sx: { width: 380, maxWidth: "100%" } } }}
      >
        <Box
          sx={{
            px: 2,
            pt: 1,
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Członkowie ({members.length})
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ cursor: "pointer" }}
            onClick={onRefresh}
          >
            Odśwież
          </Typography>
        </Box>
        {loading && (
          <MenuItem disabled>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  Ładowanie...
                </Typography>
              }
            />
          </MenuItem>
        )}
        {!loading && members.length === 0 && (
          <MenuItem disabled>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  Brak członków
                </Typography>
              }
            />
          </MenuItem>
        )}
        {sorted.map((m) => {
          const isSelf =
            currentUserId && String(m.user_id) === String(currentUserId);
          const displayEmail = m.email || null;
          return (
            <MenuItem
              key={m.user_id}
              sx={{ py: 1, alignItems: "center", gap: 1 }}
              dense
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: "0.75rem" }}>
                  {getInitials(m)}
                </Avatar>
              </ListItemIcon>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    noWrap
                    color={displayEmail ? "inherit" : "warning.main"}
                  >
                    {displayEmail || "Email nieznany"}
                  </Typography>
                  {m.role && (
                    <Chip
                      label={m.role === "owner" ? "Właściciel" : m.role}
                      size="small"
                      color={m.role === "owner" ? "primary" : "default"}
                      sx={{ height: 18, fontSize: "0.55rem" }}
                    />
                  )}
                </Box>
                {m.username && m.username !== displayEmail && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {m.username}
                  </Typography>
                )}
              </Box>
              {!isSelf && m.role !== "owner" && (
                <IconButton
                  size="small"
                  edge="end"
                  onClick={() => onRemove(m.user_id)}
                  title="Usuń użytkownika"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </MenuItem>
          );
        })}
        {sorted.length > 15 && (
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              Wyświetlono pierwsze {sorted.length} pozycji
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
