"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";

interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  storageKey: string;
}

interface UpcomingTasksCardProps {
  orgIds: string[]; // organization's IDs to filter tasks
}

export default function UpcomingTasksCard({ orgIds }: UpcomingTasksCardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || orgIds.length === 0) return;
    const loaded: TaskItem[] = [];
    orgIds.forEach((orgId) => {
      const key = `tasks_${orgId}`;
      try {
        const arr = JSON.parse(localStorage.getItem(key) || "[]");
        arr.forEach((t: any) => {
          if (t.id && t.title && t.due_date) {
            loaded.push({
              id: t.id,
              title: t.title,
              dueDate: t.due_date,
              storageKey: key,
            });
          }
        });
      } catch {}
    });
    // Sort by due datetime ascending
    loaded.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    setTasks(loaded);
  }, [orgIds]);

  const displayTasks = showAll ? tasks : tasks.slice(0, 3);

  const handleDelete = (taskToDelete: TaskItem) => {
    try {
      const arr = JSON.parse(
        localStorage.getItem(taskToDelete.storageKey) || "[]"
      );
      const updatedArr = arr.filter((t: any) => t.id !== taskToDelete.id);
      localStorage.setItem(taskToDelete.storageKey, JSON.stringify(updatedArr));
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    } catch {}
  };

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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {task.title}
                </Typography>
                <IconButton size="small" onClick={() => handleDelete(task)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Termin: {new Date(task.dueDate).toLocaleDateString()}{" "}
                {new Date(task.dueDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
              <Chip
                label={`${Math.max(
                  0,
                  Math.ceil(
                    (new Date(task.dueDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                )} dni do końca`}
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
