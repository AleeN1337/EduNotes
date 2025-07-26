"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Container,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  List,
  ListItemText,
  Button,
  TextField,
  Typography,
  Divider,
  ListItemButton,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@/lib/api";
import { UserOrganization } from "@/lib/profileApiSimple";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BookIcon from "@mui/icons-material/Book";
import SubjectIcon from "@mui/icons-material/Subject";

interface Channel {
  id: string;
  channel_name: string;
}

interface Topic {
  id: string;
  topic_name: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
}

export default function OrganizationPage() {
  // Unwrap dynamic route params
  const { orgId } = useParams() as { orgId: string };
  const router = useRouter();

  // State for organization info
  const [organizationName, setOrganizationName] = useState<string>("");

  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Load organization info
  useEffect(() => {
    if (orgId) {
      api
        .get(`/organizations/${orgId}`)
        .then((res) => {
          setOrganizationName(res.data.organization_name || `Organizacja ${orgId}`);
        })
        .catch((error) => {
          console.error("Error loading organization:", error);
          setOrganizationName(`Organizacja ${orgId}`);
        });
    }
  }, [orgId]);

  // Load channels (subjects) for organization
  useEffect(() => {
    api
      .get(`/channels/channels_in_orgazation?organization_id=${orgId}`)
      .then((res) => setChannels(res.data))
      .catch(console.error);
  }, [orgId]);
  // Select first channel by default
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      const firstChannelId = channels[0].id ?? (channels[0] as any).channel_id;
      setSelectedChannel(String(firstChannelId));
    }
  }, [channels, selectedChannel]);

  // Load topics when channel selected
  useEffect(() => {
    if (selectedChannel) {
      api
        .get(`/topics/topics_in_channel?channel_id=${selectedChannel}`)
        .then((res) => {
          const normalized: Topic[] = res.data.map((t: any) => ({
            id: String(t.id ?? t.topic_id),
            topic_name: t.topic_name,
          }));
          setTopics(normalized);
          if (normalized.length > 0) {
            setSelectedTopic(normalized[0].id);
          } else {
            setSelectedTopic(null);
            setMessages([]);
          }
        })
        .catch(console.error);
    } else {
      setTopics([]);
      setSelectedTopic(null);
      setMessages([]);
    }
  }, [selectedChannel]);
  // Select first topic by default
  useEffect(() => {
    // This logic is now handled in the topic loading useEffect
  }, [topics, selectedTopic]);

  // Load messages when topic selected
  useEffect(() => {
    if (selectedTopic) {
      api
        .get(`/notes/notes_in_topic?topic_id=${selectedTopic}`)
        .then((res) => setMessages(res.data))
        .catch(console.error);
    } else {
      setMessages([]);
    }
  }, [selectedTopic]);

  // Function to add a new channel (subject)
  const handleAddChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      // Create channel for this organization
      const response = await api.post(`/channels/`, {
        channel_name: newChannelName.trim(),
        organization_id: Number(orgId),
      });
      const newChannel = response.data;
      setNewChannelName("");

      // Reload channels list using correct endpoint
      const channelsResponse = await api.get(
        `/channels/channels_in_orgazation?organization_id=${orgId}`
      );
      const updatedChannels = channelsResponse.data.map((c: any) => ({
        ...c,
        id: String(c.id ?? c.channel_id),
      }));
      setChannels(updatedChannels);

      // Select the newly created channel
      setSelectedChannel(String(newChannel.id ?? newChannel.channel_id));
    } catch (error: any) {
      console.error(
        "Error adding channel:",
        error.response?.status,
        error.response?.data ?? error.message
      );
    }
  };

  // Function to add a new topic
  const handleAddTopic = async () => {
    if (!newTopicName.trim() || !selectedChannel) return;
    try {
      // Create topic and capture response
      const resPost = await api.post("/topics/", {
        topic_name: newTopicName.trim(),
        channel_id: Number(selectedChannel),
      });
      const createdTopic = resPost.data; // new topic with id
      setNewTopicName("");
      // Reload topics list
      const resTopics = await api.get(
        `/topics/topics_in_channel?channel_id=${selectedChannel}`
      );
      const normalizedTopics: Topic[] = resTopics.data.map((t: any) => ({
        id: String(t.id ?? t.topic_id),
        topic_name: t.topic_name,
      }));
      setTopics(normalizedTopics);
      // Automatically select the newly created topic to load its messages
      const topicId = createdTopic.id ?? (createdTopic as any).topic_id;
      setSelectedTopic(String(topicId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTopic) return;
    try {
      await api.post("/notes/", {
        content: newMessage.trim(),
        topic_id: Number(selectedTopic),
      });
      setNewMessage("");
      const res = await api.get(
        `/notes/notes_in_topic?topic_id=${selectedTopic}`
      );
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to delete a channel (subject)
  const handleDeleteChannel = async (channelId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć przedmiot?")) return;
    try {
      await api.delete(`/channels/${channelId}`);
      // Reload channels
      const res = await api.get(
        `/channels/in_organization?organization_id=${orgId}`
      );
      setChannels(res.data);
      // Reset selection if needed
      if (selectedChannel === channelId) {
        setSelectedChannel(null);
        setTopics([]);
        setMessages([]);
      }
    } catch (error) {
      console.error("Dashboard: Error deleting channel:", error);
    }
  };

  // Function to delete a topic
  const handleDeleteTopic = async (topicId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć temat?")) return;
    try {
      await api.delete(`/topics/${topicId}`);
      // Reload topics
      if (selectedChannel) {
        const res = await api.get(
          `/topics/topics_in_channel?channel_id=${selectedChannel}`
        );
        setTopics(res.data);
      }
      // Reset selection if needed
      if (selectedTopic === topicId) {
        setSelectedTopic(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Dashboard: Error deleting topic:", error);
    }
  };

  // Function to delete a message
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć wiadomość?")) return;
    try {
      await api.delete(`/notes/${messageId}`);
      // Reload messages
      if (selectedTopic) {
        const res = await api.get(
          `/notes/notes_in_topic?topic_id=${selectedTopic}`
        );
        setMessages(res.data);
      }
    } catch (error) {
      console.error("OrganizationPage: Error deleting message:", error);
    }
  };

  return (
    <div>
      <AppBar
        position="static"
        sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Button
            onClick={() => router.back()}
            sx={{
              mr: 2,
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                transform: "translateY(-1px)",
                transition: "all 0.2s ease",
              },
            }}
          >
            ← Powrót
          </Button>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
            }}
          >
            🏢 {organizationName || `Organizacja ${orgId}`}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          mt: { xs: 2, sm: 3 },
          mb: 4,
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 1,
              fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
            }}
          >
            🏢 {organizationName || `Organizacja ${orgId}`}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
          >
            Zarządzaj przedmiotami, tematami i prowadź dyskusje
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 1fr",
            },
            gap: 3,
          }}
        >
          {/* Chat Section */}
          <Card
            sx={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 3,
              transition: "all 0.3s ease",
            }}
          >
            <CardHeader
              avatar={<ChatBubbleOutlineIcon sx={{ color: "primary.main" }} />}
              title={
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  💬 Czat
                </Typography>
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ height: 400, overflowY: "auto", pt: 1 }}>
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    p: 2,
                    backgroundColor: "grey.50",
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: "grey.100",
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {msg.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteMessage(msg.id)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "error.light",
                        color: "white",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </CardContent>
            <Divider />
            <CardActions sx={{ p: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Napisz wiadomość..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                sx={{ mr: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Wyślij
              </Button>
            </CardActions>
          </Card>

          {/* Sidebar */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Subjects Card */}
            <Card
              sx={{
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                borderRadius: 3,
                transition: "all 0.3s ease",
              }}
            >
              <CardHeader
                avatar={<BookIcon sx={{ color: "secondary.main" }} />}
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    📚 Przedmioty
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <CardContent sx={{ pt: 1 }}>
                <List sx={{ py: 0 }}>
                  {channels.map((ch) => {
                    const cid = ch.id ?? (ch as any).channel_id;
                    return (
                      <ListItemButton
                        key={String(cid)}
                        selected={String(cid) === selectedChannel}
                        onClick={() => setSelectedChannel(String(cid))}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          "&.Mui-selected": {
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                            "&:hover": {
                              backgroundColor: "primary.main",
                            },
                          },
                          "&:hover": {
                            backgroundColor: "grey.100",
                          },
                        }}
                      >
                        <ListItemText
                          primary={ch.channel_name}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChannel(String(cid));
                          }}
                          sx={{
                            "&:hover": {
                              backgroundColor: "error.light",
                              color: "white",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemButton>
                    );
                  })}
                </List>
              </CardContent>
              <Divider />
              <CardActions sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Nowy przedmiot"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddChannel()}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddChannel}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Dodaj
                </Button>
              </CardActions>
            </Card>

            {/* Topics Card */}
            {selectedChannel && (
              <Card
                sx={{
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                }}
              >
                <CardHeader
                  avatar={<SubjectIcon sx={{ color: "warning.main" }} />}
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      📝 Tematy
                    </Typography>
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ pt: 1 }}>
                  <List sx={{ py: 0 }}>
                    {topics.map((tp) => (
                      <ListItemButton
                        key={tp.id}
                        selected={tp.id === selectedTopic}
                        onClick={() => setSelectedTopic(tp.id)}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          "&.Mui-selected": {
                            backgroundColor: "warning.light",
                            color: "warning.contrastText",
                            "&:hover": {
                              backgroundColor: "warning.main",
                            },
                          },
                          "&:hover": {
                            backgroundColor: "grey.100",
                          },
                        }}
                      >
                        <ListItemText
                          primary={tp.topic_name}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTopic(tp.id);
                          }}
                          sx={{
                            "&:hover": {
                              backgroundColor: "error.light",
                              color: "white",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemButton>
                    ))}
                  </List>
                </CardContent>
                <Divider />
                <CardActions sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Nowy temat"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTopic()}
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddTopic}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                    }}
                  >
                    Dodaj
                  </Button>
                </CardActions>
              </Card>
            )}
          </Box>
        </Box>
      </Container>
    </div>
  );
}
