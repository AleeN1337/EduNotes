"use client";
import React, { useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
  Divider,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Task } from "./types";

export interface TaskMenuProps {
  tasks: Task[];
  onDelete: (taskId: string) => void;
  adding: boolean;
  onOpenAdd: () => void;
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

/**
 * Dropdown menu for tasks shown in navbar with badge counter
 */
export default function TaskMenu(props: TaskMenuProps) {
  const {
    tasks,
    onDelete,
    adding,
    onOpenAdd,
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const sorted = [...tasks].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  const limited = sorted.slice(0, 6); // show first 6 in dropdown
  const extra = sorted.length - limited.length;

  return (
    <>
      <Tooltip title="Zadania">
        <IconButton color="inherit" onClick={handleOpen} size="small">
          <Badge
            badgeContent={tasks.length > 99 ? "99+" : tasks.length}
            color={tasks.length ? "error" : "default"}
          >
            <AssignmentIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{ paper: { sx: { width: 360, maxWidth: "100%" } } }}
      >
        <Box sx={{ px: 2, pt: 1, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Zadania ({tasks.length})
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                handleClose();
                onOpenAdd();
              }}
            >
              Dodaj
            </Button>
          </Box>
          <Divider />
        </Box>
        {tasks.length === 0 && (
          <MenuItem disabled>
            <ListItemText
              primary={
                <Typography color="text.secondary">Brak zadań</Typography>
              }
            />
          </MenuItem>
        )}
        {limited.map((task) => {
          const due = new Date(task.due_date);
          const now = new Date();
          const msDiff = due.getTime() - now.getTime();
          const isSoon = msDiff < 1000 * 60 * 60 * 24 && msDiff > 0;
          return (
            <MenuItem key={task.id} sx={{ py: 1 }} dense>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, mt: 0.2 }}>
                  <AssignmentIcon fontSize="small" />
                </ListItemIcon>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {task.title}
                    </Typography>
                    {isSoon && (
                      <WarningAmberIcon
                        sx={{ color: "error.main" }}
                        fontSize="small"
                        titleAccess="Termin zadania mija w ciągu 24h!"
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {due.toLocaleString()}
                  </Typography>
                </Box>
                <IconButton
                  edge="end"
                  size="small"
                  aria-label="Usuń"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          );
        })}
        {extra > 0 && (
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              +{extra} więcej...
            </Typography>
          </MenuItem>
        )}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Kliknij Dodaj aby utworzyć nowe zadanie.
          </Typography>
        </Box>
      </Menu>

      {/* Dialog dodawania zadania przeniesiony z TasksCard */}
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
          <Button onClick={onCloseAdd} color="inherit">
            Anuluj
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Dodaj
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
