"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Note } from "@/types";

export default function RecentNotesCard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  // local ratings no longer drive counters here; dashboard shows backend counts only

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const res = await api.get("/notes/my");
        const raw = Array.isArray(res.data?.data) ? res.data.data : [];
        // Normalize to Note shape with stable unique id
        const normalized: Note[] = raw.map((n: any) => {
          const id = String(
            n?.note_id ??
              n?.id ??
              `${n?.organization_id ?? "org"}-${n?.topic_id ?? "topic"}-$${
                n?.title ?? "title"
              }-${n?.created_at ?? Date.now()}`
          );
          return {
            id,
            title: String(n?.title ?? "")
              .trim()
              .substring(0, 200),
            content: String(n?.content ?? ""),
            organization_id: String(n?.organization_id ?? ""),
            channel_id:
              n?.channel_id != null ? String(n.channel_id) : undefined,
            topic_id: n?.topic_id != null ? String(n.topic_id) : undefined,
            author_id: String(n?.user_id ?? n?.author_id ?? ""),
            created_at: String(n?.created_at ?? new Date().toISOString()),
            updated_at: String(
              n?.updated_at ?? n?.created_at ?? new Date().toISOString()
            ),
            likes: typeof n?.likes === "number" ? n.likes : 0,
            dislikes: typeof n?.dislikes === "number" ? n.dislikes : 0,
          } as Note;
        });
        // sort ascending (older first)
        normalized.sort(
          (a: Note, b: Note) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setNotes(normalized);
      } catch (err: any) {
        if (err.response?.status === 404) {
          console.log("Notes endpoint not available yet - showing empty state");
          setNotes([]);
        } else {
          console.error("RecentNotesCard: Error fetching notes", err);
          setNotes([]);
        }
      }
    };
    loadNotes();
  }, []);
  // No local toggles; show only backend-provided counts
  const getDisplayedLikes = (note: Note) =>
    typeof note.likes === "number" ? note.likes : 0;
  const getDisplayedDislikes = (note: Note) =>
    typeof note.dislikes === "number" ? note.dislikes : 0;

  return (
    <Card sx={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
          }}
        >
          📝 Najnowsze notatki
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {notes.slice(-3).map((note) => (
            <Box
              key={note.id}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                "&:hover": { backgroundColor: "action.hover" },
                cursor: "pointer",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={() => setSelected(note)}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {note.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  mt: 0.5,
                }}
              >
                {note.content}
              </Typography>
              <Typography
                variant="caption"
                color="primary"
                sx={{ mt: 0.5, textDecoration: "underline" }}
              >
                Kliknij, aby zobaczyć więcej
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(note.created_at).toLocaleString()}
              </Typography>
              <Box
                sx={{ mt: 1, display: "flex", gap: 1, alignItems: "center" }}
              >
                {getDisplayedLikes(note) > 0 ? (
                  <>
                    <ThumbUpIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {getDisplayedLikes(note)}
                    </Typography>
                  </>
                ) : getDisplayedDislikes(note) > 0 ? (
                  <>
                    <ThumbDownIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {getDisplayedDislikes(note)}
                    </Typography>
                  </>
                ) : null}
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
      {/* Details dialog */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="sm"
      >
        {selected && (
          <>
            <DialogTitle>{selected.title}</DialogTitle>
            <DialogContent dividers>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                {new Date(selected.created_at).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {selected.content}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelected(null)}>Zamknij</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
}
