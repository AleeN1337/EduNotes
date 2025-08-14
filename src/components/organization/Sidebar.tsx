"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  Divider,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import BookIcon from "@mui/icons-material/Book";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import TopicIcon from "@mui/icons-material/Topic";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import InvitationsPanel from "./InvitationsPanel";
import { Channel, Topic, Invite } from "./types";

export interface SidebarProps {
  channels: Channel[];
  expanded: Record<string, boolean>;
  channelTopics: Record<string, Topic[]>;
  selectedChannel: string | null;
  selectedTopic: string | null;
  addingTopicToChannel: string | null;
  deletingChannel: string | null;
  newChannelName: string;
  newTopicName: string;
  onToggleChannel: (id: string) => void;
  onSelectTopic: (topic: Topic, channel: Channel) => void;
  onSetAddingTopicToChannel: (id: string | null) => void;
  onChangeTopicName: (v: string) => void;
  onAddTopicToChannel: (channelId: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onDeleteChannel: (channelId: string) => void;
  onChangeChannelName: (v: string) => void;
  onAddChannel: () => void;
  inviteEmail: string;
  onChangeInviteEmail: (v: string) => void;
  onSendInvite: () => void;
  pendingInvitesCount: number;
  invites?: Invite[];
}

export default function Sidebar(props: SidebarProps) {
  const {
    channels,
    expanded,
    channelTopics,
    selectedChannel,
    selectedTopic,
    addingTopicToChannel,
    deletingChannel,
    newChannelName,
    newTopicName,
    onToggleChannel,
    onSelectTopic,
    onSetAddingTopicToChannel,
    onChangeTopicName,
    onAddTopicToChannel,
    onDeleteTopic,
    onDeleteChannel,
    onChangeChannelName,
    onAddChannel,
    inviteEmail,
    onChangeInviteEmail,
    onSendInvite,
    pendingInvitesCount,
    invites,
  } = props;

  // Search state
  const [search, setSearch] = React.useState("");

  // Context menu state
  const [channelMenuAnchor, setChannelMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const [channelMenuId, setChannelMenuId] = React.useState<string | null>(null);
  const [topicMenuAnchor, setTopicMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const [topicMenuId, setTopicMenuId] = React.useState<string | null>(null);

  const openChannelMenu = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.stopPropagation();
    setChannelMenuAnchor(e.currentTarget);
    setChannelMenuId(id);
  };
  const closeChannelMenu = () => {
    setChannelMenuAnchor(null);
    setChannelMenuId(null);
  };
  const openTopicMenu = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.stopPropagation();
    setTopicMenuAnchor(e.currentTarget);
    setTopicMenuId(id);
  };
  const closeTopicMenu = () => {
    setTopicMenuAnchor(null);
    setTopicMenuId(null);
  };

  // Derived: filtered channels/topics
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q)
      return channels.map((ch) => ({
        channel: ch,
        topics: channelTopics[String(ch.id)] || [],
      }));
    return channels
      .map((ch) => {
        const cid = String(ch.id);
        const topics = channelTopics[cid] || [];
        const chMatch = ch.channel_name.toLowerCase().includes(q);
        const matchedTopics = topics.filter((t) =>
          t.topic_name.toLowerCase().includes(q)
        );
        return chMatch
          ? { channel: ch, topics }
          : matchedTopics.length > 0
          ? { channel: ch, topics: matchedTopics }
          : null;
      })
      .filter(Boolean) as { channel: Channel; topics: Topic[] }[];
  }, [search, channels, channelTopics]);

  return (
    <Card
      sx={{
        flex: 1,
        borderRadius: 0,
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <CardHeader
        avatar={<BookIcon sx={{ color: "var(--foreground)" }} />}
        title={
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "var(--foreground)" }}
          >
            Przedmioty i Tematy
          </Typography>
        }
        sx={{
          pb: 1,
          backgroundColor: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      />
      <CardContent sx={{ pt: 1, flex: 1, overflow: "auto" }}>
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Szukaj przedmiotów/tematów"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        {filtered.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              color: "text.secondary",
              py: 4,
            }}
          >
            <Typography variant="body2">
              {search.trim()
                ? "Brak wyników"
                : 'Brak przedmiotów. Użyj pola "Nowy przedmiot" aby dodać.'}
            </Typography>
          </Box>
        ) : null}

        <List sx={{ py: 0 }}>
          {filtered.map(({ channel: ch, topics: channelTopicsData }) => {
            const cid = String(ch.id);
            const isExpanded = expanded[cid] || false;

            return (
              <Box key={cid} sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => {
                    onToggleChannel(cid);
                  }}
                  sx={{
                    borderRadius: 2,
                    backgroundColor:
                      selectedChannel === cid
                        ? "var(--secondary)"
                        : "transparent",
                    "&:hover": { backgroundColor: "var(--muted)" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {ch.channel_name}
                        </Typography>
                        {selectedChannel === cid ? (
                          <Chip
                            size="small"
                            label="Aktywny"
                            color="info"
                            variant="outlined"
                          />
                        ) : null}
                      </Box>
                    }
                  />
                  <Tooltip title="Więcej">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => openChannelMenu(e, cid)}
                      sx={{
                        color: "var(--muted-foreground)",
                        "&:hover": { backgroundColor: "var(--muted)" },
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemButton>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List sx={{ pl: 2, py: 0 }}>
                    {addingTopicToChannel === cid && (
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "var(--secondary)",
                          borderRadius: 2,
                          mb: 1,
                          border: "1px solid var(--border)",
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Nazwa nowego tematu"
                          value={newTopicName}
                          onChange={(e) => onChangeTopicName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") onAddTopicToChannel(cid);
                            if (e.key === "Escape")
                              onSetAddingTopicToChannel(null);
                          }}
                          sx={{ mb: 1 }}
                          autoFocus
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onAddTopicToChannel(cid)}
                          >
                            <AddIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => onSetAddingTopicToChannel(null)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    )}

                    {channelTopicsData.map((topic) => (
                      <Box
                        key={topic.id}
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <ListItemButton
                          onClick={() => onSelectTopic(topic, ch)}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            ml: 2,
                            backgroundColor:
                              selectedTopic === topic.id
                                ? "var(--secondary)"
                                : "transparent",
                            "&:hover": {
                              backgroundColor: "var(--muted)",
                            },
                            flex: 1,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <TopicIcon
                              fontSize="small"
                              sx={{ color: "var(--primary)" }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={topic.topic_name}
                            primaryTypographyProps={{
                              fontWeight:
                                selectedTopic === topic.id ? 600 : 400,
                              fontSize: "0.9rem",
                              noWrap: true,
                            }}
                          />
                        </ListItemButton>
                        <Tooltip title="Więcej">
                          <IconButton
                            size="small"
                            onClick={(e) => openTopicMenu(e, String(topic.id))}
                            sx={{
                              mr: 1,
                              color: "var(--muted-foreground)",
                              "&:hover": { backgroundColor: "var(--muted)" },
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </CardContent>
      <Divider />
      <Box sx={{ p: 2, backgroundColor: "var(--sidebar)" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Nowy przedmiot"
            value={newChannelName}
            onChange={(e) => onChangeChannelName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddChannel()}
          />
          <IconButton
            color="primary"
            size="small"
            onClick={() => onAddChannel()}
            disabled={!newChannelName.trim()}
            sx={{
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              "&:hover": { backgroundColor: "var(--muted)" },
              height: 40,
              width: 40,
              alignSelf: "center",
            }}
            aria-label="Dodaj przedmiot"
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <InvitationsPanel
        inviteEmail={inviteEmail}
        onChangeEmail={onChangeInviteEmail}
        onSendInvite={onSendInvite}
        pendingCount={pendingInvitesCount}
        invites={invites}
      />

      {/* Channel context menu */}
      <Menu
        anchorEl={channelMenuAnchor}
        open={Boolean(channelMenuAnchor)}
        onClose={closeChannelMenu}
      >
        <MenuItem
          onClick={() => {
            if (channelMenuId) onSetAddingTopicToChannel(channelMenuId);
            closeChannelMenu();
          }}
        >
          Dodaj temat
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (channelMenuId) onDeleteChannel(channelMenuId);
            closeChannelMenu();
          }}
          disabled={deletingChannel === channelMenuId}
        >
          Usuń przedmiot
        </MenuItem>
      </Menu>

      {/* Topic context menu */}
      <Menu
        anchorEl={topicMenuAnchor}
        open={Boolean(topicMenuAnchor)}
        onClose={closeTopicMenu}
      >
        <MenuItem
          onClick={() => {
            if (topicMenuId) onDeleteTopic(topicMenuId);
            closeTopicMenu();
          }}
        >
          Usuń temat
        </MenuItem>
      </Menu>
    </Card>
  );
}
