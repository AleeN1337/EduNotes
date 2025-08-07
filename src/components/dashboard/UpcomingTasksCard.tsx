"use client";

import { Box, Card, CardContent, Typography, Chip, Button } from "@mui/material";
import { useEffect, useState } from "react";

interface TaskItem {
  title: string;
  dueDate: string;
}

export default function UpcomingTasksCard() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loaded: TaskItem[] = [];
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("tasks_")) {
        try {
          const arr = JSON.parse(localStorage.getItem(key) || "[]");
          arr.forEach((t: any) => {
            // t.due_date stored from org page
            if (t.title && t.due_date) {
              loaded.push({ title: t.title, dueDate: t.due_date });
            }
          });
        } catch {}
      }
    });
    // Sort by due datetime ascending
    loaded.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    setTasks(loaded);
  }, []);

  const displayTasks = showAll ? tasks : tasks.slice(0, 3);

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
          {displayTasks.map((task, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {task.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Termin: {new Date(task.dueDate).toLocaleDateString()} {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
              <Chip
                label={`${Math.max(0, Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dni do końca`}
                size="small"
                color="warning"
              />
            </Box>
          ))}
          {tasks.length > 3 && (
            <Button size="small" onClick={() => setShowAll((prev) => !prev)}>
              {showAll ? "Pokaż mniej" : "Pokaż wszystkie zadania"}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
