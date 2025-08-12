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
} from "@mui/material";
import BookIcon from "@mui/icons-material/Book";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import TopicIcon from "@mui/icons-material/Topic";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import InvitationsPanel from "./InvitationsPanel";
import { Channel, Topic } from "./types";

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
  } = props;

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
        avatar={<BookIcon sx={{ color: "#2c3e50" }} />}
        title={
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50" }}>
            Przedmioty i Tematy
          </Typography>
        }
        sx={{
          pb: 1,
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
        }}
      />
      <CardContent sx={{ pt: 1, flex: 1, overflow: "auto" }}>
        <List sx={{ py: 0 }}>
          {channels.map((ch) => {
            const cid = String(ch.id);
            const isExpanded = expanded[cid] || false;
            const channelTopicsData = channelTopics[cid] || [];

            return (
              <Box key={cid} sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => {
                    onToggleChannel(cid);
                  }}
                  sx={{
                    borderRadius: 2,
                    backgroundColor:
                      selectedChannel === cid ? "#e3f2fd" : "transparent",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {ch.channel_name}
                        </Typography>
                      </Box>
                    }
                  />
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetAddingTopicToChannel(cid);
                    }}
                    sx={{
                      mr: 1,
                      color: "#27ae60",
                      "&:hover": { backgroundColor: "#27ae60", color: "white" },
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChannel(cid);
                    }}
                    disabled={deletingChannel === cid}
                    sx={{
                      color: "#e74c3c",
                      "&:hover": { backgroundColor: "#e74c3c", color: "white" },
                    }}
                  >
                    {deletingChannel === cid ? (
                      <HourglassEmptyIcon fontSize="small" />
                    ) : (
                      <DeleteIcon fontSize="small" />
                    )}
                  </IconButton>
                </ListItemButton>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List sx={{ pl: 2, py: 0 }}>
                    {addingTopicToChannel === cid && (
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: "#f0f8ff",
                          borderRadius: 2,
                          mb: 1,
                          border: "1px solid #e3f2fd",
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
                            <DeleteIcon />
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
                                ? "#fff3e0"
                                : "transparent",
                            "&:hover": {
                              backgroundColor:
                                selectedTopic === topic.id
                                  ? "#ffe0b2"
                                  : "#f5f5f5",
                            },
                            flex: 1,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <TopicIcon
                              fontSize="small"
                              sx={{ color: "#ff9800" }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={topic.topic_name}
                            primaryTypographyProps={{
                              fontWeight:
                                selectedTopic === topic.id ? 600 : 400,
                              fontSize: "0.9rem",
                            }}
                          />
                        </ListItemButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTopic(topic.id);
                          }}
                          sx={{
                            mr: 1,
                            color: "#e74c3c",
                            "&:hover": {
                              backgroundColor: "#e74c3c",
                              color: "white",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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
      <Box sx={{ p: 2, backgroundColor: "white" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Nowy przedmiot"
          value={newChannelName}
          onChange={(e) => onChangeChannelName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddChannel()}
          sx={{ mr: 1 }}
        />
      </Box>
      <InvitationsPanel
        inviteEmail={inviteEmail}
        onChangeEmail={onChangeInviteEmail}
        onSendInvite={onSendInvite}
        pendingCount={pendingInvitesCount}
      />
    </Card>
  );
}
