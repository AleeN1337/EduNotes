"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { CreateOrganizationDialogProps } from "./types";

export default function CreateOrganizationDialog({
  open,
  onClose,
  newOrgName,
  onNameChange,
  creating,
  onSubmit,
}: CreateOrganizationDialogProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !creating) {
      onSubmit();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AddIcon />
        Utwórz nową organizację
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="Nazwa organizacji"
            placeholder="np. Szkoła Podstawowa nr 1"
            value={newOrgName}
            onChange={(e) => onNameChange(e.target.value)}
            fullWidth
            variant="outlined"
            disabled={creating}
            onKeyPress={handleKeyPress}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={creating}>
          Anuluj
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!newOrgName.trim() || creating}
          startIcon={creating ? null : <AddIcon />}
        >
          {creating ? "Tworzenie..." : "Utwórz organizację"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
