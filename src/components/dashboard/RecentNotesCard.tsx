"use client";

import { Box, Card, CardContent, Typography, Button } from "@mui/material";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Note } from "@/types";

export default function RecentNotesCard() {
  const [notes, setNotes] = useState<Note[]>([]);

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
            sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
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
              sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, '&:hover': { backgroundColor: 'action.hover' } }}
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
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
