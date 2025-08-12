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
  Menu,
  MenuItem,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import AddIcon from "@mui/icons-material/Add";
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
    if (initialCapturedRef.current) return;
    try {
      const stored = JSON.parse(localStorage.getItem(ratingsKey) || "{}");
      initialRatingsRef.current = stored;
    } catch {
      initialRatingsRef.current = {};
    }
    initialCapturedRef.current = true;
  }, [ratingsKey]);

  const getDisplayedLikes = (msg: Message) => {
    const base = typeof msg.likes === "number" ? msg.likes : 0;
    const initialLiked = !!initialRatingsRef.current[msg.id]?.liked;
    const currentLiked = !!messageRatings[msg.id]?.liked;
    return base - (initialLiked ? 1 : 0) + (currentLiked ? 1 : 0);
  };

  const getDisplayedDislikes = (msg: Message) => {
    const base = typeof msg.dislikes === "number" ? msg.dislikes : 0;
    const initial = !!initialRatingsRef.current[msg.id]?.disliked;
    const current = !!messageRatings[msg.id]?.disliked;
    return base - (initial ? 1 : 0) + (current ? 1 : 0);
  };
  const isImageLink = (url?: string) =>
    !!url && /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);

  // Plus menu state
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuMsg, setMenuMsg] = React.useState<Message | null>(null);
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuMsg(null);
  };

  // Track image render failures to fallback to a link
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});
  const markImageFailed = (id: string) =>
    setFailedImages((prev) => ({ ...prev, [id]: true }));

  // Blob URL cache for protected images
  const [imageBlobUrls, setImageBlobUrls] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    let cancelled = false;
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const candidates = messages.filter(
      (m) =>
        m.image_url &&
        (isImageLink(m.image_url) || (m.content_type || "").toLowerCase().startsWith("image")) &&
        !imageBlobUrls[m.id]
    );
    candidates.forEach(async (m) => {
      try {
        const resp = await fetch(m.image_url as string, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!resp.ok) throw new Error("image fetch failed");
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        if (!cancelled) {
          setImageBlobUrls((prev) => ({ ...prev, [m.id]: url }));
        }
      } catch (e) {
        // leave it to try direct URL; onError will show link
      }
    });
    return () => {
      cancelled = true;
    };
  }, [messages, imageBlobUrls]);
  // Revoke blob URLs on unmount
  React.useEffect(() => {
    return () => {
      Object.values(imageBlobUrls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imageBlobUrls]);

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
                  "&:hover .message-plus": {
                    opacity: 1,
                    visibility: "visible",
                  },
                }}
              >
                {/* Avatar moved inside bubble (bottom-left). No external avatar here. */}
                {/* Actions hidden under plus menu */}
                <Box
                  sx={{
                    p: 2,
                    pl: 6, // make room for avatar inside bubble (left)
                    pb: 5, // make room for avatar inside bubble (bottom)
                    position: "relative",
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
                    // reveal timestamp only when hovering the bubble
                    "&:hover .message-timestamp": {
                      opacity: 1,
                      transform: "translateY(0px)",
                    },
                  }}
                >
                  {/* In-bubble avatar at bottom-left */}
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      position: "absolute",
                      left: 8,
                      bottom: 8,
                      backgroundColor:
                        userColors[msg.user_id] ??
                        getColorForUser(String(msg.user_id)),
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      border: "2px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    {getUserInitials(msg.user_id)}
                  </Avatar>
                  {/* Image/file attachment preview */}
                  {msg.image_url && (
        !failedImages[msg.id] ? (
                      <Box sx={{ mt: 0.5, mb: 1 }}>
                        <a href={msg.image_url} target="_blank" rel="noreferrer">
                          <img
          src={imageBlobUrls[msg.id] || msg.image_url}
                            alt="Załącznik"
                            onError={() => markImageFailed(msg.id)}
                            style={{ maxWidth: "100%", borderRadius: 8, display: "block" }}
                          />
                        </a>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 0.5, mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          <a
                            href={msg.image_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "inherit", textDecoration: "underline" }}
                          >
                            Pobierz załącznik
                          </a>
                        </Typography>
                      </Box>
                    )
                  )}
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {msg.content}
                  </Typography>
                  {/* Hidden timestamp under the bubble, shows on hover */}
                  <Typography
                    className="message-timestamp"
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      position: "absolute",
                      bottom: -16,
                      left: isOwn ? "auto" : 8,
                      right: isOwn ? 8 : "auto",
                      opacity: 0,
                      transform: "translateY(4px)",
                      transition: "opacity 0.15s ease, transform 0.15s ease",
                      pointerEvents: "none",
                    }}
                  >
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </Typography>
                </Box>
                {/* Always-visible like/dislike counters next to the bubble */}
                {(getDisplayedLikes(msg) > 0 || getDisplayedDislikes(msg) > 0) && (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      backgroundColor: "#eceff1",
                      borderRadius: 999,
                      px: 1,
                      py: 0.25,
                      color: "#546e7a",
                      fontSize: 12,
                    }}
                  >
                    {getDisplayedLikes(msg) > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <ThumbUpIcon sx={{ fontSize: 14, color: "#1565c0" }} />
                        <Typography variant="caption" sx={{ lineHeight: 1 }}>
                          {getDisplayedLikes(msg)}
                        </Typography>
                      </Box>
                    )}
                    {getDisplayedDislikes(msg) > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <ThumbDownIcon sx={{ fontSize: 14, color: "#c62828" }} />
                        <Typography variant="caption" sx={{ lineHeight: 1 }}>
                          {getDisplayedDislikes(msg)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                {/* No side action stacks; plus menu instead */}
                <IconButton
                  size="small"
                  className="message-plus"
                  aria-label="Akcje wiadomości"
                  onClick={(e) => {
                    setMenuAnchor(e.currentTarget);
                    setMenuMsg(msg);
                  }}
                  sx={{
                    opacity: 0,
                    visibility: "hidden",
                    transition: "opacity 0.15s ease",
                    color: "#90a4ae",
                    "&:hover": { backgroundColor: "#eceff1" },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                {/* Right-side avatar for own messages */}
                {/* No external avatar for own messages; avatar is inside bubble. */}
              </Box>
            );
          })
        )}
      </CardContent>
      {/* Single contextual menu for like/dislike/delete */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && menuMsg)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MenuItem
          onClick={() => {
            if (!menuMsg) return;
            const liked = !!messageRatings[menuMsg.id]?.liked;
            const next = {
              ...messageRatings,
              [menuMsg.id]: { liked: !liked, disliked: false },
            } as Record<string, { liked: boolean; disliked: boolean }>;
            setMessageRatings(next);
            try {
              localStorage.setItem(ratingsKey, JSON.stringify(next));
            } catch {}
            if (!liked) {
              api
                .post(`/notes/give_like`, null, {
                  params: { note_id: menuMsg.id },
                })
                .catch(() => {});
            }
            closeMenu();
          }}
        >
          <ThumbUpIcon
            fontSize="small"
            style={{
              marginRight: 8,
              color:
                menuMsg && messageRatings[menuMsg.id]?.liked
                  ? "#1565c0"
                  : undefined,
            }}
          />
          Polub
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!menuMsg) return;
            const disliked = !!messageRatings[menuMsg.id]?.disliked;
            const next = {
              ...messageRatings,
              [menuMsg.id]: { liked: false, disliked: !disliked },
            } as Record<string, { liked: boolean; disliked: boolean }>;
            setMessageRatings(next);
            try {
              localStorage.setItem(ratingsKey, JSON.stringify(next));
            } catch {}
            if (!disliked) {
              api
                .post(`/notes/give_dislike`, null, {
                  params: { note_id: menuMsg.id },
                })
                .catch(() => {});
            }
            closeMenu();
          }}
        >
          <ThumbDownIcon
            fontSize="small"
            style={{
              marginRight: 8,
              color:
                menuMsg && messageRatings[menuMsg.id]?.disliked
                  ? "#c62828"
                  : undefined,
            }}
          />
          Nie lubię
        </MenuItem>
        {menuMsg && myId !== null && String(menuMsg.user_id) === myId && (
          <MenuItem
            onClick={() => {
              if (!menuMsg) return;
              onDeleteMessage(String(menuMsg.id));
              closeMenu();
            }}
          >
            <DeleteIcon
              fontSize="small"
              style={{ marginRight: 8, color: "#e53935" }}
            />
            Usuń
          </MenuItem>
        )}
      </Menu>
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
            disabled={!canSend}
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
