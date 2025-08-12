"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Divider,
  Box,
  TextField,
  IconButton,
  Button,
  Avatar,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { Message } from "./types";
import api from "@/lib/api";

export interface ChatAreaProps {
  title: string;
  messages: Message[];
  currentUserId: string | null;
  userColors: Record<string, string>;
  getUserInitials: (userId: string) => string;
  selectedFile: File | null;
  onRemoveFile: () => void;
  newMessage: string;
  onChangeMessage: (v: string) => void;
  canSend: boolean;
  onSend: () => void;
  onDeleteMessage: (id: string) => void; // kept for compatibility, not rendered
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  messageRatings: Record<string, { liked: boolean; disliked: boolean }>; // kept, not used
  setMessageRatings: React.Dispatch<
    React.SetStateAction<Record<string, { liked: boolean; disliked: boolean }>>
  >; // kept, not used
  ratingsKey: string; // kept, not used
}

export default function ChatArea(props: ChatAreaProps) {
  const {
    title,
    messages,
    currentUserId,
    userColors,
    getUserInitials,
    selectedFile,
    onRemoveFile,
    newMessage,
    onChangeMessage,
    canSend,
    onSend,
    onDeleteMessage,
    onFileSelect,
    messageRatings,
    setMessageRatings,
    ratingsKey,
  } = props;

  // Robustly resolve current user id (fallback to localStorage if prop is missing)
  const myId = React.useMemo(() => {
    if (currentUserId) return String(currentUserId);
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const u = JSON.parse(raw);
      const candidate = u?.id ?? u?.user_id ?? u?.data?.id ?? u?.data?.user_id;
      return candidate != null ? String(candidate) : null;
    } catch {
      return null;
    }
  }, [currentUserId]);

  // Deterministic color per user id so all clients see the same colors
  const getColorForUser = (userId: string) => {
    const palette = [
      "#e57373",
      "#64b5f6",
      "#81c784",
      "#ffb74d",
      "#9575cd",
      "#4db6ac",
      "#ba68c8",
      "#90a4ae",
      "#f06292",
      "#7986cb",
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
    const idx = Math.abs(hash) % palette.length;
    return palette[idx];
  };

  // Capture initial ratings to avoid double-counting when showing like totals
  const initialRatingsRef = React.useRef<
    Record<string, { liked: boolean; disliked: boolean }>
  >({});
  const initialCapturedRef = React.useRef(false);
  React.useEffect(() => {
    if (!initialCapturedRef.current) {
      initialRatingsRef.current = messageRatings;
      initialCapturedRef.current = true;
    }
  }, [messageRatings]);

  const getDisplayedLikes = (msg: Message) => {
    const base = typeof msg.likes === "number" ? msg.likes : 0;
    const initialLiked = !!initialRatingsRef.current[msg.id]?.liked;
    const currentLiked = !!messageRatings[msg.id]?.liked;
    return base - (initialLiked ? 1 : 0) + (currentLiked ? 1 : 0);
  };

  return (
    <Card
      sx={{
        flex: 1,
        borderRadius: 0,
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader
        avatar={<ChatBubbleOutlineIcon sx={{ color: "#3498db" }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50" }}>
            {title}
          </Typography>
        }
        sx={{
          pb: 1,
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
        }}
      />
      <CardContent
        sx={{ flex: 1, overflowY: "auto", pt: 1, backgroundColor: "#fafafa" }}
      >
        {!canSend ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">
              📝 Wybierz temat aby zobaczyć wiadomości
            </Typography>
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">
              💬 Brak wiadomości w tym temacie. Napisz pierwszą!
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isOwn = myId !== null && String(msg.user_id) === myId;
            return (
              <Box
                key={msg.id}
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: isOwn ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                  mb: 2,
                  gap: 1,
                  "&:hover .message-actions": {
                    opacity: 1,
                    visibility: "visible",
                  },
                }}
              >
                {!isOwn && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor:
                        userColors[msg.user_id] ??
                        getColorForUser(String(msg.user_id)),
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {getUserInitials(msg.user_id)}
                  </Avatar>
                )}
                {/* Actions on the left for own messages */}
                {isOwn && (
                  <Box
                    className="message-actions"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      opacity: 0,
                      visibility: "hidden",
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    {/* Like count above like icon */}
                    {getDisplayedLikes(msg) > 0 && (
                      <Typography
                        variant="caption"
                        sx={{ textAlign: "center", color: "text.secondary" }}
                      >
                        {getDisplayedLikes(msg)}
                      </Typography>
                    )}
                    {/* Like toggle available for all messages */}
                    <IconButton
                      size="small"
                      aria-label="Polub wiadomość"
                      onClick={() => {
                        const liked = !!messageRatings[msg.id]?.liked;
                        const next = {
                          ...messageRatings,
                          [msg.id]: { liked: !liked, disliked: false },
                        } as Record<
                          string,
                          { liked: boolean; disliked: boolean }
                        >;
                        setMessageRatings(next);
                        try {
                          localStorage.setItem(
                            ratingsKey,
                            JSON.stringify(next)
                          );
                        } catch {}
                        // optimistic like count update and backend call
                        if (!liked) {
                          api
                            .post(`/notes/give_like`, null, {
                              params: { note_id: msg.id },
                            })
                            .catch(() => {});
                        }
                      }}
                      sx={{
                        color: messageRatings[msg.id]?.liked
                          ? "#1565c0"
                          : "#90a4ae",
                        "&:hover": { backgroundColor: "#eceff1" },
                      }}
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                    {/* Dislike toggle available for all messages */}
                    <IconButton
                      size="small"
                      aria-label="Nie lubię tej wiadomości"
                      onClick={() => {
                        const disliked = !!messageRatings[msg.id]?.disliked;
                        const next = {
                          ...messageRatings,
                          [msg.id]: { liked: false, disliked: !disliked },
                        } as Record<
                          string,
                          { liked: boolean; disliked: boolean }
                        >;
                        setMessageRatings(next);
                        try {
                          localStorage.setItem(
                            ratingsKey,
                            JSON.stringify(next)
                          );
                        } catch {}
                        if (!disliked) {
                          api
                            .post(`/notes/give_dislike`, null, {
                              params: { note_id: msg.id },
                            })
                            .catch(() => {});
                        }
                      }}
                      sx={{
                        color: messageRatings[msg.id]?.disliked
                          ? "#c62828"
                          : "#90a4ae",
                        "&:hover": { backgroundColor: "#ffebee" },
                      }}
                    >
                      <ThumbDownIcon fontSize="small" />
                    </IconButton>
                    {/* Delete only for own messages */}
                    <IconButton
                      size="small"
                      aria-label="Usuń wiadomość"
                      onClick={() => onDeleteMessage(String(msg.id))}
                      sx={{
                        color: "#e57373",
                        "&:hover": { backgroundColor: "#ffebee" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <Box
                  sx={{
                    p: 2,
                    maxWidth: "70%",
                    width: "auto",
                    backgroundColor: getColorForUser(String(msg.user_id)),
                    color: "#2c3e50",
                    borderRadius: isOwn
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {msg.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5, opacity: 0.7 }}
                  >
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </Typography>
                </Box>
                {/* Actions on the right for other users' messages */}
                {!isOwn && (
                  <Box
                    className="message-actions"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      opacity: 0,
                      visibility: "hidden",
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    {getDisplayedLikes(msg) > 0 && (
                      <Typography
                        variant="caption"
                        sx={{ textAlign: "center", color: "text.secondary" }}
                      >
                        {getDisplayedLikes(msg)}
                      </Typography>
                    )}
                    <IconButton
                      size="small"
                      aria-label="Polub wiadomość"
                      onClick={() => {
                        const liked = !!messageRatings[msg.id]?.liked;
                        const next = {
                          ...messageRatings,
                          [msg.id]: { liked: !liked, disliked: false },
                        } as Record<
                          string,
                          { liked: boolean; disliked: boolean }
                        >;
                        setMessageRatings(next);
                        try {
                          localStorage.setItem(
                            ratingsKey,
                            JSON.stringify(next)
                          );
                        } catch {}
                        if (!liked) {
                          api
                            .post(`/notes/give_like`, null, {
                              params: { note_id: msg.id },
                            })
                            .catch(() => {});
                        }
                      }}
                      sx={{
                        color: messageRatings[msg.id]?.liked
                          ? "#1565c0"
                          : "#90a4ae",
                        "&:hover": { backgroundColor: "#eceff1" },
                      }}
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                    {/* Dislike toggle */}
                    <IconButton
                      size="small"
                      aria-label="Nie lubię tej wiadomości"
                      onClick={() => {
                        const disliked = !!messageRatings[msg.id]?.disliked;
                        const next = {
                          ...messageRatings,
                          [msg.id]: { liked: false, disliked: !disliked },
                        } as Record<
                          string,
                          { liked: boolean; disliked: boolean }
                        >;
                        setMessageRatings(next);
                        try {
                          localStorage.setItem(
                            ratingsKey,
                            JSON.stringify(next)
                          );
                        } catch {}
                        if (!disliked) {
                          api
                            .post(`/notes/give_dislike`, null, {
                              params: { note_id: msg.id },
                            })
                            .catch(() => {});
                        }
                      }}
                      sx={{
                        color: messageRatings[msg.id]?.disliked
                          ? "#c62828"
                          : "#90a4ae",
                        "&:hover": { backgroundColor: "#ffebee" },
                      }}
                    >
                      <ThumbDownIcon fontSize="small" />
                    </IconButton>
                    {/* No delete for other users' messages */}
                  </Box>
                )}
                {/* Right-side avatar for own messages */}
                {isOwn && (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor:
                        userColors[msg.user_id] ??
                        getColorForUser(String(msg.user_id)),
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {getUserInitials(msg.user_id)}
                  </Avatar>
                )}
              </Box>
            );
          })
        )}
      </CardContent>
      <Divider />
      <CardActions
        sx={{ p: 2, flexDirection: "column", gap: 1, backgroundColor: "white" }}
      >
        {selectedFile && (
          <Box
            sx={{
              width: "100%",
              p: 1,
              backgroundColor: "#f0f8ff",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #e3f2fd",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              📎 {selectedFile.name}
            </Typography>
            <IconButton
              size="small"
              onClick={onRemoveFile}
              sx={{ "&:hover": { backgroundColor: "#e74c3c", color: "white" } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <Box
          sx={{ display: "flex", width: "100%", gap: 1, alignItems: "center" }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder={
              canSend
                ? "Napisz wiadomość..."
                : "Wybierz temat aby pisać wiadomości"
            }
            value={newMessage}
            onChange={(e) => onChangeMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSend && onSend()}
            disabled={!canSend}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "20px" } }}
          />
          <input
            accept="image/*,application/pdf,.doc,.docx,.txt"
            style={{ display: "none" }}
            id="file-upload"
            type="file"
            onChange={onFileSelect}
          />
          <label htmlFor="file-upload">
            <IconButton
              component="span"
              sx={{
                color: "#7f8c8d",
                "&:hover": { backgroundColor: "#ecf0f1", color: "#2c3e50" },
              }}
            >
              <AttachFileIcon />
            </IconButton>
          </label>
          <Button
            variant="contained"
            onClick={onSend}
            disabled={!canSend || !newMessage.trim()}
            startIcon={<SendIcon />}
            sx={{
              borderRadius: "20px",
              textTransform: "none",
              fontWeight: 500,
              minWidth: "80px",
              backgroundColor: "#3498db",
              "&:hover": { backgroundColor: "#2980b9" },
            }}
          >
            Wyślij
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}
