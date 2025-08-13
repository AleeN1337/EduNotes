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
  Dialog,
  DialogContent,
  Chip,
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
  const [failedImages, setFailedImages] = React.useState<
    Record<string, boolean>
  >({});
  const markImageFailed = (id: string) =>
    setFailedImages((prev) => ({ ...prev, [id]: true }));

  // Blob URL cache for protected images
  const [imageBlobUrls, setImageBlobUrls] = React.useState<
    Record<string, string>
  >({});
  React.useEffect(() => {
    let cancelled = false;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const candidates = messages.filter(
      (m) =>
        m.image_url &&
        (isImageLink(m.image_url) ||
          (m.content_type || "").toLowerCase().startsWith("image")) &&
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

  // Locally order messages so newest appear at the bottom
  const orderedMessages = React.useMemo(() => {
    const arr = [...messages];
    arr.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return arr;
  }, [messages]);

  // Lightbox state for images
  const [lightboxUrl, setLightboxUrl] = React.useState<string | null>(null);
  const openLightbox = (url: string) => setLightboxUrl(url);
  const closeLightbox = () => setLightboxUrl(null);

  // Auto-scroll to bottom on messages or typing changes
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const t = setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      0
    );
    return () => clearTimeout(t);
  }, [orderedMessages.length, newMessage]);

  // Helpers
  const formatDayLabel = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (isSameDay(d, today)) return "Dziś";
    if (isSameDay(d, yesterday)) return "Wczoraj";
    return d.toLocaleDateString();
  };

  // (removed duplicate bottomRef/effect)

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
        avatar={<ChatBubbleOutlineIcon sx={{ color: "var(--primary)" }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--foreground)" }}>
            {title}
          </Typography>
        }
        sx={{
          pb: 1,
          backgroundColor: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      />
      <CardContent
        sx={{ flex: 1, overflowY: "auto", pt: 1, backgroundColor: "var(--card)" }}
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
          // Render with date separators
          orderedMessages.map((msg, idx) => {
            const prev = orderedMessages[idx - 1];
            const showDateSeparator =
              !prev ||
              new Date(prev.created_at).toDateString() !==
                new Date(msg.created_at).toDateString();
            const isOwn = myId !== null && String(msg.user_id) === myId;
            return (
              <React.Fragment key={msg.id}>
                {showDateSeparator && (
                  <Box sx={{ width: "100%", my: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Divider sx={{ flex: 1 }} />
                      <Chip
                        size="small"
                        label={formatDayLabel(msg.created_at)}
                      />
                      <Divider sx={{ flex: 1 }} />
                    </Box>
                  </Box>
                )}
                <Box
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
                    {msg.image_url &&
                      (!failedImages[msg.id] ? (
                        <Box sx={{ mt: 0.5, mb: 1 }}>
                          <img
                            src={imageBlobUrls[msg.id] || msg.image_url}
                            alt="Załącznik"
                            onError={() => markImageFailed(msg.id)}
                            onClick={() =>
                              openLightbox(
                                imageBlobUrls[msg.id] || msg.image_url!
                              )
                            }
                            style={{
                              maxWidth: "100%",
                              borderRadius: 8,
                              display: "block",
                              cursor: "zoom-in",
                            }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ mt: 0.5, mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            <a
                              href={msg.image_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "inherit",
                                textDecoration: "underline",
                              }}
                            >
                              Pobierz załącznik
                            </a>
                          </Typography>
                        </Box>
                      ))}
                    {msg.content?.trim() ? (
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {msg.content}
                      </Typography>
                    ) : null}
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
                  {(getDisplayedLikes(msg) > 0 ||
                    getDisplayedDislikes(msg) > 0) && (
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.75,
                        backgroundColor: "var(--muted)",
                        borderRadius: 999,
                        px: 1,
                        py: 0.25,
                        color: "var(--muted-foreground)",
                        fontSize: 12,
                      }}
                    >
                      {getDisplayedLikes(msg) > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <ThumbUpIcon
                            sx={{ fontSize: 14, color: "var(--primary)" }}
                          />
                          <Typography variant="caption" sx={{ lineHeight: 1 }}>
                            {getDisplayedLikes(msg)}
                          </Typography>
                        </Box>
                      )}
                      {getDisplayedDislikes(msg) > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <ThumbDownIcon
                            sx={{ fontSize: 14, color: "var(--destructive)" }}
                          />
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
            color: "var(--muted-foreground)",
            "&:hover": { backgroundColor: "var(--muted)" },
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                  {/* Right-side avatar for own messages */}
                  {/* No external avatar for own messages; avatar is inside bubble. */}
                </Box>
              </React.Fragment>
            );
          })
        )}
        {/* Typing indicator (local) */}
        {newMessage?.trim() ? (
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", pr: 1, pb: 0.5 }}
          >
            <Box
              sx={{
                backgroundColor: "var(--muted)",
                borderRadius: 2,
                px: 1.25,
                py: 0.75,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 6,
                  background: "var(--muted-foreground)",
                  display: "inline-block",
                  animation: "blink 1.2s infinite",
                }}
              />
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 6,
                  background: "var(--muted-foreground)",
                  display: "inline-block",
                  animation: "blink 1.2s 0.2s infinite",
                }}
              />
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 6,
                  background: "var(--muted-foreground)",
                  display: "inline-block",
                  animation: "blink 1.2s 0.4s infinite",
                }}
              />
            </Box>
          </Box>
        ) : null}
        <style>{`
          @keyframes blink {
            0% { opacity: 0.2; transform: translateY(0px); }
            20% { opacity: 1; transform: translateY(-1px); }
            100% { opacity: 0.2; transform: translateY(0px); }
          }
        `}</style>
        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </CardContent>
      {/* Lightbox dialog */}
      <Dialog
        open={!!lightboxUrl}
        onClose={closeLightbox}
        fullWidth
        maxWidth="md"
      >
        <DialogContent sx={{ p: 0, backgroundColor: "#000" }}>
          {lightboxUrl ? (
            <img
              src={lightboxUrl}
              alt="Podgląd"
              style={{ width: "100%", height: "auto", display: "block" }}
              onClick={closeLightbox}
            />
          ) : null}
        </DialogContent>
      </Dialog>
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
      ? "var(--primary)"
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
      ? "var(--destructive)"
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
              style={{ marginRight: 8, color: "var(--destructive)" }}
            />
            Usuń
          </MenuItem>
        )}
      </Menu>
      <Divider />
      <CardActions
        sx={{ p: 2, flexDirection: "column", gap: 1, backgroundColor: "var(--card)" }}
      >
        {selectedFile && (
          <Box
            sx={{
              width: "100%",
              p: 1,
              backgroundColor: "var(--muted)",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid var(--border)",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              📎 {selectedFile.name}
            </Typography>
            <IconButton
              size="small"
              onClick={onRemoveFile}
              sx={{ color: "var(--destructive)", "&:hover": { backgroundColor: "var(--muted)" } }}
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
                color: "var(--muted-foreground)",
                "&:hover": { backgroundColor: "var(--muted)", color: "var(--foreground)" },
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
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              "&:hover": { opacity: 0.95 },
            }}
          >
            Wyślij
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}
