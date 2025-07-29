"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";

export default function QuickStatsCards() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        📊 Szybki przegląd
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
              --
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Moje notatki
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="h3" color="secondary" sx={{ fontWeight: 700 }}>
              --
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aktywne kursy
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Typography
              variant="h3"
              color="warning.main"
              sx={{ fontWeight: 700 }}
            >
              --
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Zadania dzisiaj
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Typography
              variant="h3"
              color="success.main"
              sx={{ fontWeight: 700 }}
            >
              --
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Godzin nauki
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
