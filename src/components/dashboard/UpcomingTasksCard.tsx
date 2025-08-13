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
import api from "@/lib/api";

interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  organizationId?: string;
}

interface UpcomingTasksCardProps {
  orgIds: string[]; // organization's IDs to filter tasks
}

export default function UpcomingTasksCard({ orgIds }: UpcomingTasksCardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (orgIds.length === 0) return;
    let active = true;
    (async () => {
      const mapAndSort = (arr: any[]): TaskItem[] => {
        const filtered = arr
          .filter((d) =>
            orgIds.includes(String(d.organization_id ?? d.organizationId))
          )
          .map((d) => ({
            id: String(d.deadline_id ?? d.id),
            title: d.event_name,
            dueDate: d.event_date,
            organizationId: String(d.organization_id ?? ""),
          })) as TaskItem[];
        filtered.sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        return filtered;
      };

      try {
        // Preferred: only my deadlines
        const res = await api.get(`/deadlines/my_deadlines`);
        const raw = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        if (active) setTasks(mapAndSort(raw as any[]));
        return;
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          console.warn("/deadlines/my_deadlines failed, trying /deadlines/", err);
        }
      }

      try {
        // Fallback: all deadlines (filter client-side)
        const res2 = await api.get(`/deadlines/`);
        const raw2 = Array.isArray(res2.data)
          ? res2.data
          : res2.data?.data ?? [];
        if (active) setTasks(mapAndSort(raw2 as any[]));
      } catch (err2) {
        if (active) setTasks([]);
        console.error("Failed to load deadlines via fallback:", err2);
      }
    })();
    return () => {
      active = false;
    };
  }, [orgIds]);

  const displayTasks = showAll ? tasks : tasks.slice(0, 3);

  const handleDelete = async (taskToDelete: TaskItem) => {
    try {
      await api.delete(`/deadlines/${taskToDelete.id}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    } catch (err) {
      console.error("Failed to delete deadline:", err);
    }
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
