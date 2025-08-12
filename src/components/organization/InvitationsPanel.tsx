"use client";
import React from "react";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export interface InvitationsPanelProps {
  inviteEmail: string;
  onChangeEmail: (v: string) => void;
  onSendInvite: () => void;
  pendingCount: number;
  onEnter?: () => void;
}

export default function InvitationsPanel(props: InvitationsPanelProps) {
  const { inviteEmail, onChangeEmail, onSendInvite, pendingCount } = props;

  return (
    <Box
      sx={{ p: 2, backgroundColor: "white", borderTop: "1px solid #e0e0e0" }}
    >
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, fontWeight: 600, color: "#2c3e50" }}
      >
        Zaproszenia
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Email użytkownika"
          value={inviteEmail}
          onChange={(e) => onChangeEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendInvite()}
        />
        <IconButton
          onClick={onSendInvite}
          sx={{
            color: "#3498db",
            "&:hover": { backgroundColor: "#3498db", color: "white" },
          }}
        >
          <PersonAddIcon fontSize="small" />
        </IconButton>
      </Box>
      {pendingCount > 0 && (
        <Typography variant="caption" color="text.secondary">
          {pendingCount} oczekujących zaproszeń
        </Typography>
      )}
    </Box>
  );
}
