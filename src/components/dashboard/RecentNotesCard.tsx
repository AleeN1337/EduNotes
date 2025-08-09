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
  // ratings per note id, including counts
  type Rating = { liked: boolean; disliked: boolean; likes: number; dislikes: number };
  const [ratings, setRatings] = useState<Record<string, Rating>>({});

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const res = await api.get("/notes/my");
        const arr = Array.isArray(res.data?.data) ? res.data.data : [];
        // sort ascending (older first)
        arr.sort(
          (a: Note, b: Note) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setNotes(arr);
      } catch (err) {
        console.error("RecentNotesCard: Error fetching notes", err);
      }
    };
    loadNotes();
  }, []);
  // load ratings
  useEffect(() => {
    try {
      const stored: Record<string, Rating> = JSON.parse(localStorage.getItem("noteRatings") || "{}");
      // initialize missing counts
      const normalized: Record<string, Rating> = {};
      Object.entries(stored).forEach(([id, r]) => {
        normalized[id] = {
          liked: r.liked,
          disliked: r.disliked,
          likes: typeof r.likes === 'number' ? r.likes : 0,
          dislikes: typeof r.dislikes === 'number' ? r.dislikes : 0,
        };
      });
      setRatings(normalized);
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
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Like button and count (only one note at a time) */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    color={ratings[note.id]?.liked ? 'primary' : 'default'}
                    onClick={() => {
                      setRatings(prev => {
                        const newRatings: Record<string, any> = {};
                        notes.slice(-3).forEach(n => {
                          const curr = prev[n.id] || { liked: false, disliked: false, likes: 0, dislikes: 0 };
                          if (n.id === note.id) {
                            let { liked, disliked, likes, dislikes } = curr;
                            if (!liked) {
                              likes++;
                              liked = true;
                              if (disliked) { dislikes--; disliked = false; }
                            } else {
                              likes--; liked = false;
                            }
                            newRatings[n.id] = { liked, disliked, likes, dislikes };
                          } else {
                            // clear other likes/dislikes
                            newRatings[n.id] = { ...curr, liked: false, disliked: false };
                          }
                        });
                        localStorage.setItem('noteRatings', JSON.stringify(newRatings));
                        return newRatings;
                      });
                    }}
                  >
                    <ThumbUpIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption">{ratings[note.id]?.likes || 0}</Typography>
                </Box>
                {/* Dislike button and count (only one note at a time) */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    color={ratings[note.id]?.disliked ? 'error' : 'default'}
                    onClick={() => {
                      setRatings(prev => {
                        const newRatings: Record<string, any> = {};
                        notes.slice(-3).forEach(n => {
                          const curr = prev[n.id] || { liked: false, disliked: false, likes: 0, dislikes: 0 };
                          if (n.id === note.id) {
                            let { liked, disliked, likes, dislikes } = curr;
                            if (!disliked) {
                              dislikes++;
                              disliked = true;
                              if (liked) { likes--; liked = false; }
                            } else {
                              dislikes--; disliked = false;
                            }
                            newRatings[n.id] = { liked, disliked, likes, dislikes };
                          } else {
                            newRatings[n.id] = { ...curr, liked: false, disliked: false };
                          }
                        });
                        localStorage.setItem('noteRatings', JSON.stringify(newRatings));
                        return newRatings;
                      });
                    }}
                  >
                    <ThumbDownIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption">{ratings[note.id]?.dislikes || 0}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
