"use client";

import { Box, Card, CardContent, Typography, Button } from "@mui/material";

export default function RecentNotesCard() {
  return (
    <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            📝 Najnowsze notatki
          </Typography>
          <Button variant="outlined" size="small">
            Zobacz wszystkie
          </Button>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3].map((item) => (
            <Box
              key={item}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Ładowanie notatek...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dane będą pobierane z API
              </Typography>
              <Typography variant="caption" color="text.secondary">
                -- minut temu
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
