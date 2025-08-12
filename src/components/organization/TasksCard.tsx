"use client";
import React from "react";
import {
  Card,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Task } from "./types";

export interface TasksCardProps {
  tasks: Task[];
  onDelete: (taskId: string) => void;
  onOpenAdd: () => void;
  adding: boolean;
  onCloseAdd: () => void;
  newTaskTitle: string;
  newTaskDate: string;
  newTaskTime: string;
  onChangeTitle: (v: string) => void;
  onChangeDate: (v: string) => void;
  onChangeTime: (v: string) => void;
  onSubmit: () => void;
  error?: string;
}

export default function TasksCard(props: TasksCardProps) {
  const {
    tasks,
    onDelete,
    onOpenAdd,
    adding,
    onCloseAdd,
    newTaskTitle,
    newTaskDate,
    newTaskTime,
    onChangeTitle,
    onChangeDate,
    onChangeTime,
    onSubmit,
    error,
  } = props;

  return (
    <Card sx={{ mb: 2, mx: 2 }}>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentIcon sx={{ color: "#1976d2" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Zadania
            </Typography>
          </Box>
        }
        action={
          <IconButton
            color="primary"
            aria-label="Dodaj zadanie"
            onClick={onOpenAdd}
          >
            <AddIcon />
          </IconButton>
        }
      />

      <List sx={{ maxHeight: 200, overflow: "auto" }}>
        {tasks.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography color="text.secondary">Brak zadań</Typography>
              }
            />
          </ListItem>
        ) : (
          tasks.map((task) => {
            const due = new Date(task.due_date);
            const now = new Date();
            const msDiff = due.getTime() - now.getTime();
            const isSoon = msDiff < 1000 * 60 * 60 * 24 && msDiff > 0;
            return (
              <ListItem
                key={task.id}
                sx={{ py: 0.5 }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="usuń"
                    onClick={() => onDelete(task.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <AssignmentIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontWeight: 500 }}>
                        {task.title}
                      </Typography>
                      {isSoon && (
                        <WarningAmberIcon
                          sx={{ color: "error.main" }}
                          titleAccess="Termin zadania mija w ciągu 24h!"
                        />
                      )}
                    </Box>
                  }
                  secondary={due.toLocaleString()}
                />
              </ListItem>
            );
          })
        )}
      </List>

      {/* Dialog dodawania zadania */}
      <Dialog open={adding} onClose={onCloseAdd} maxWidth="xs" fullWidth>
        <DialogTitle>Dodaj nowe zadanie</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <TextField
            label="Nazwa zadania"
            value={newTaskTitle}
            onChange={(e) => onChangeTitle(e.target.value)}
            autoFocus
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Data"
              type="date"
              value={newTaskDate}
              onChange={(e) => onChangeDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Godzina"
              type="time"
              value={newTaskTime}
              onChange={(e) => onChangeTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <IconButton onClick={onCloseAdd} color="secondary">
            <DeleteIcon />
          </IconButton>
          <IconButton onClick={onSubmit} color="primary">
            <AddIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
