"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";

export default function CalendarWidget() {
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
          📅 Kalendarz
        </Typography>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography
            variant="h2"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            {new Date().getDate()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {new Date().toLocaleDateString("pl-PL", {
              month: "long",
              year: "numeric",
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Brak wydarzeń dzisiaj
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
