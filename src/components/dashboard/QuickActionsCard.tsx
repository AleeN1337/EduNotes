"use client";

import { Box, Card, CardContent, Typography, Button } from "@mui/material";

export default function QuickActionsCard() {
  return (
    <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          ⚡ Szybkie akcje
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            sx={{ py: 1.5, justifyContent: "flex-start" }}
            startIcon={<span>📝</span>}
          >
            Utwórz notatkę
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 1.5, justifyContent: "flex-start" }}
            startIcon={<span>📁</span>}
          >
            Przeglądaj pliki
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ py: 1.5, justifyContent: "flex-start" }}
            startIcon={<span>🔍</span>}
          >
            Wyszukaj notatki
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
