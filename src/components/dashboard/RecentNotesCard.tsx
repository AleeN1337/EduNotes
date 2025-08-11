"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Note } from "@/types";

export default function RecentNotesCard() {
  const [notes, setNotes] = useState<Note[]>([]);
  // ratings per note id
  const [ratings, setRatings] = useState<
    Record<string, { liked: boolean; disliked: boolean }>
  >({});

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
  // load ratings
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("noteRatings") || "{}");
      setRatings(stored);
    } catch {}
  }, []);

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
          {notes.slice(-3).map((note) => (
            <Box
              key={note.id}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {note.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {note.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(note.created_at).toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                <IconButton
                  size="small"
                  color={ratings[note.id]?.liked ? "primary" : "default"}
                  onClick={() => {
                    setRatings((prev) => {
                      const curr = prev[note.id] || {
                        liked: false,
                        disliked: false,
                      };
                      const updated = {
                        liked: !curr.liked,
                        disliked: curr.liked ? curr.disliked : curr.disliked,
                      };
                      const newAll = { ...prev, [note.id]: updated };
                      localStorage.setItem(
                        "noteRatings",
                        JSON.stringify(newAll)
                      );
                      return newAll;
                    });
                  }}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color={ratings[note.id]?.disliked ? "error" : "default"}
                  onClick={() => {
                    setRatings((prev) => {
                      const curr = prev[note.id] || {
                        liked: false,
                        disliked: false,
                      };
                      const updated = {
                        disliked: !curr.disliked,
                        liked: curr.disliked ? curr.liked : curr.liked,
                      };
                      const newAll = { ...prev, [note.id]: updated };
                      localStorage.setItem(
                        "noteRatings",
                        JSON.stringify(newAll)
                      );
                      return newAll;
                    });
                  }}
                >
                  <ThumbDownIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
