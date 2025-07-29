"use client";

import { Box, Card, CardContent, Typography, Chip } from "@mui/material";

export default function UpcomingTasksCard() {
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
          ⏰ Nadchodzące zadania
        </Typography>
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
                Zadanie {item}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Dane z API
              </Typography>
              <Chip label="-- dni" size="small" color="warning" />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
