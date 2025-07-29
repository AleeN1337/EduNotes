"use client";

import { Snackbar, Alert } from "@mui/material";
import { NotificationSnackbarProps } from "./types";

export default function NotificationSnackbar({
  notification,
  onClose,
}: NotificationSnackbarProps) {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={notification.severity}
        sx={{
          width: "100%",
          fontSize: "1rem",
          "& .MuiAlert-message": {
            fontWeight: 500,
          },
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
}
