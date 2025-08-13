"use client";
import React from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EmailIcon from "@mui/icons-material/Email";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { Invite } from "./types";

export interface InvitationsPanelProps {
  inviteEmail: string;
  onChangeEmail: (v: string) => void;
  onSendInvite: () => void;
  pendingCount: number;
  onEnter?: () => void;
  invites?: Invite[];
}

export default function InvitationsPanel(props: InvitationsPanelProps) {
  const { inviteEmail, onChangeEmail, onSendInvite, pendingCount, invites } =
    props;

  const [openSnack, setOpenSnack] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const emailValid = React.useMemo(
    () => /.+@.+\..+/.test(inviteEmail.trim()),
    [inviteEmail]
  );

  const handleSend = async () => {
    if (!emailValid) {
      setError("Nieprawidłowy email");
      return;
    }
    setError(null);
    try {
      await Promise.resolve(onSendInvite());
      setOpenSnack(true);
    } catch (_e) {
      setError("Nie udało się wysłać zaproszenia");
    }
  };

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
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          error={Boolean(error)}
          helperText={error || ""}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Tooltip
          title={emailValid ? "Wyślij zaproszenie" : "Wpisz poprawny email"}
        >
          <span>
            <IconButton
              onClick={handleSend}
              disabled={!emailValid}
              sx={{
                color: "#3498db",
                "&:hover": { backgroundColor: "#3498db", color: "white" },
              }}
            >
              <PersonAddIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: invites && invites.length ? 1 : 0,
        }}
      >
        <Chip
          size="small"
          color="default"
          variant="outlined"
          icon={<PendingActionsIcon fontSize="small" />}
          label={`Oczekujące: ${pendingCount}`}
        />
      </Box>

      {invites && invites.length > 0 && (
        <List dense sx={{ maxHeight: 140, overflow: "auto", mt: 0 }}>
          {invites.map((inv) => (
            <ListItem key={inv.id} sx={{ py: 0 }}>
              <ListItemText
                primary={inv.email}
                secondary={`${inv.status} • ${new Date(
                  inv.invited_at
                ).toLocaleString()}`}
                primaryTypographyProps={{ sx: { fontSize: 13 } }}
                secondaryTypographyProps={{
                  sx: { fontSize: 11, color: "text.secondary" },
                }}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Snackbar
        open={openSnack}
        autoHideDuration={2500}
        onClose={() => setOpenSnack(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setOpenSnack(false)}
          sx={{ width: "100%" }}
        >
          Zaproszenie wysłane
        </Alert>
      </Snackbar>
    </Box>
  );
}
