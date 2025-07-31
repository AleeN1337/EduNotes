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
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  TextField,
  Typography,
  Divider,
  ListItemButton,
  IconButton,
  AppBar,
  Toolbar,
  Collapse,
  Chip,
  Input,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import TopicIcon from "@mui/icons-material/Topic";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import BookIcon from "@mui/icons-material/Book";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SendIcon from "@mui/icons-material/Send";
import api from "@/lib/api";
import { UserOrganization } from "@/lib/profileApiSimple";

interface Channel {
  id: string;
  channel_name: string;
  topics?: Topic[];
}

interface Topic {
  id: string;
  topic_name: string;
  channel_id: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  image_url?: string;
  user_id: string;
}
interface Invite {
  id: string;
  email: string;
  status: string;
  invited_at: string;
}

export default function OrganizationPage() {
  // Unwrap dynamic route params
  const { orgId } = useParams() as { orgId: string };
  const router = useRouter();

  // State for organization info
  const [organizationName, setOrganizationName] = useState<string>("");

  const [channels, setChannels] = useState<Channel[]>([]);
  const [expandedChannels, setExpandedChannels] = useState<{
    [key: string]: boolean;
  }>({});
  const [channelTopics, setChannelTopics] = useState<{
    [key: string]: Topic[];
  }>({});
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [newChannelName, setNewChannelName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [addingTopicToChannel, setAddingTopicToChannel] = useState<
    string | null
  >(null);
  const [deletingChannel, setDeletingChannel] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [userColors, setUserColors] = useState<Record<string, string>>({});

  // Define a set of distinct pastel colors for users
  const colorOptions = [
    "#FFCDD2", // red lighten
    "#C8E6C9", // green lighten
    "#BBDEFB", // blue lighten
    "#FFF9C4", // yellow lighten
    "#D1C4E9", // purple lighten
    "#FFE0B2", // orange lighten
    "#F0F4C3", // lime lighten
    "#B2EBF2", // cyan lighten
  ];

  // Function to generate user initials
  const getUserInitials = (userId: string) => {
    // For now, use user ID to generate initials
    // In real app, you'd fetch actual user names
    const id = parseInt(userId) || 0;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const first = letters[id % 26];
    const second = letters[(id + 1) % 26];
    return `${first}${second}`;
  };

  // Load organization info
  useEffect(() => {
    if (orgId) {
      api
        .get(`/organizations/${orgId}`)
        .then((res) => {
          // Unwrap wrapper if present
          const orgData = res.data.data ?? res.data;
          setOrganizationName(
            orgData.organization_name || `Organizacja ${orgId}`
          );
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
      .get(`/channels/channels_in_organization?organization_id=${orgId}`)
      .then((res) => {
        // Unwrap wrapper if present
        const raw = Array.isArray(res.data) ? res.data : res.data.data ?? [];
        const normalizedChannels = (raw as any[]).map((c: any) => ({
          ...c,
          id: String(c.id ?? c.channel_id),
        }));
        setChannels(normalizedChannels);

        // Load topics for each channel
        normalizedChannels.forEach((channel: Channel) => {
          if (channel.id && channel.id !== "undefined") {
            loadTopicsForChannel(channel.id);
          }
        });
      })
      .catch((error) => {
        console.log("Failed to load channels:", error);
        console.log("Error response:", error.response?.data);
        console.log("Error status:", error.response?.status);

        // Jeśli backend zwraca 404 z informacją o braku kanałów, to nie jest błąd
        if (
          error.response?.status === 404 &&
          error.response?.data?.detail?.includes("No channels found")
        ) {
          console.log(
            "No channels found in organization - this is normal for empty organizations"
          );
          setChannels([]); // Ustaw pustą listę kanałów
        } else {
          // Inne błędy 404 lub inne kody błędów
          console.error("Unexpected error loading channels:", error);
          setChannels([]); // Ustaw pustą listę aby zapobiec problemom z UI
        }
      });
  }, [orgId]);

  // Function to load topics for a specific channel
  const loadTopicsForChannel = async (channelId: string) => {
    try {
      const res = await api.get(
        `/topics/topics_in_channel?channel_id=${channelId}`
      );
      // Unwrap wrapper if present
      const raw = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      const normalizedTopics: Topic[] = (raw as any[]).map((t: any) => ({
        id: String(t.id ?? t.topic_id),
        topic_name: t.topic_name,
        channel_id: channelId,
      }));

      setChannelTopics((prev) => ({
        ...prev,
        [channelId]: normalizedTopics,
      }));
    } catch (error: any) {
      // If it's a 404, it likely means no topics in this channel - this is normal
      if (error.response?.status === 404) {
        console.log(
          `No topics found in channel ${channelId} - this is normal for empty channels`
        );
        setChannelTopics((prev) => ({
          ...prev,
          [channelId]: [],
        }));
      } else {
        // For other errors, log as actual error
        console.error(`Error loading topics for channel ${channelId}:`, error);
        setChannelTopics((prev) => ({
          ...prev,
          [channelId]: [],
        }));
      }
    }
  };

  // Function to get current topic name
  const getCurrentTopicName = () => {
    if (!selectedTopic) return null;

    // Find the topic in channelTopics
    for (const topics of Object.values(channelTopics)) {
      const topic = topics.find((t) => t.id === selectedTopic);
      if (topic) return topic.topic_name;
    }
    return "Nieznany temat";
  };
  // Function to get current channel name
  const getCurrentChannelName = () => {
    if (!selectedChannel) return null;
    const channel = channels.find((c) => c.id === selectedChannel);
    return channel ? channel.channel_name : null;
  };

  // Handle selecting topics and channels
  const handleTopicClick = (topic: Topic, channel: Channel) => {
    console.log(`Switching to topic: ${topic.topic_name} (ID: ${topic.id})`);
    setSelectedChannel(channel.id);
    setSelectedTopic(topic.id);
    // Messages will be loaded automatically by the useEffect hook
  };

  // Toggle channel expansion
  const toggleChannelExpansion = (channelId: string) => {
    setExpandedChannels((prev) => ({
      ...prev,
      [channelId]: !prev[channelId],
    }));
  };

  // Handle file selection for upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Upload file function
  const uploadFile = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle successful upload
      console.log("File uploaded successfully:", response.data);
      setSelectedFile(null);

      // You can add the file URL to the message here
      return response.data.file_url;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  // Select first channel by default
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      const firstChannelId = channels[0].id ?? (channels[0] as any).channel_id;
      if (firstChannelId && String(firstChannelId) !== "undefined") {
        setSelectedChannel(String(firstChannelId));
      }
    }
  }, [channels, selectedChannel]);

  // Load topics when channel selected
  useEffect(() => {
    if (selectedChannel) {
      // Use the hierarchical topic loading approach
      const topicsInChannel = channelTopics[selectedChannel] || [];
      if (topicsInChannel.length > 0) {
        setSelectedTopic(topicsInChannel[0].id);
      } else {
        setSelectedTopic(null);
        setMessages([]);
      }
    } else {
      setSelectedTopic(null);
      setMessages([]);
    }
  }, [selectedChannel]);

  // Update selected topic when topics for current channel change
  useEffect(() => {
    if (selectedChannel) {
      const topicsInChannel = channelTopics[selectedChannel] || [];
      if (topicsInChannel.length > 0 && !selectedTopic) {
        setSelectedTopic(topicsInChannel[0].id);
      } else if (topicsInChannel.length === 0) {
        setSelectedTopic(null);
        setMessages([]);
      }
    }
  }, [channelTopics, selectedChannel, selectedTopic]);

  // Select first topic by default
  useEffect(() => {
    // This logic is now handled in the topic loading useEffect
  }, [selectedTopic]);

  // Load messages when topic selected
  useEffect(() => {
    if (selectedTopic) {
      api
        .get(`/notes/notes_in_topic?topic_id=${selectedTopic}`)
        .then((res) => {
          // Unwrap wrapper if present
          const raw = Array.isArray(res.data) ? res.data : res.data.data ?? [];
          // Normalize notes into Message shape
          const normalized = (raw as any[]).map((m: any) => ({
            id: String(m.note_id ?? m.id),
            content: m.content,
            created_at: m.created_at,
            image_url: m.image_url,
            user_id: String(m.user_id),
          }));
          setMessages(normalized);
        })
        .catch((error) => {
          // If it's a 404, it likely means no messages in this topic - set empty array
          if (error.response?.status === 404) {
            setMessages([]);
          } else {
            console.error("Error loading messages:", error);
          }
        });
    } else {
      setMessages([]);
    }
  }, [selectedTopic]);

  // Poll messages every 5 seconds for real-time updates
  useEffect(() => {
    if (!selectedTopic) return;
    const interval = setInterval(() => {
      api
        .get(`/notes/notes_in_topic?topic_id=${selectedTopic}`)
        .then((res) => {
          const raw = Array.isArray(res.data) ? res.data : res.data.data ?? [];
          const normalized = (raw as any[]).map((m: any) => ({
            id: String(m.note_id ?? m.id),
            content: m.content,
            created_at: m.created_at,
            image_url: m.image_url,
            user_id: String(m.user_id),
          }));
          setMessages(normalized);
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            setMessages([]);
          } else {
            console.error("Error polling messages:", error);
          }
        });
    }, 5000);
    return () => clearInterval(interval);
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
      // Unwrap created channel from response wrapper
      const newChannel = response.data.data ?? response.data;
      setNewChannelName("");

      // Reload channels list
      const channelsResponse = await api.get(
        `/channels/channels_in_organization?organization_id=${orgId}`
      );
      // Unwrap list from possible wrapper
      const rawChannels = Array.isArray(channelsResponse.data)
        ? channelsResponse.data
        : channelsResponse.data.data ?? [];
      const updatedChannels = (rawChannels as any[]).map((c: any) => ({
        ...c,
        id: String(c.id ?? c.channel_id),
      }));
      setChannels(updatedChannels);

      // Select the newly created channel
      setSelectedChannel(String(newChannel.id ?? newChannel.channel_id));
    } catch (error: any) {
      console.warn("Error adding channel (allowing duplicates):", error);
      // Reload channels list even on error
      const channelsResponse = await api.get(
        `/channels/channels_in_organization?organization_id=${orgId}`
      );
      const rawChannels = Array.isArray(channelsResponse.data)
        ? channelsResponse.data
        : channelsResponse.data.data ?? [];
      const updatedChannels = (rawChannels as any[]).map((c: any) => ({
        ...c,
        id: String(c.id ?? c.channel_id),
      }));
      setChannels(updatedChannels);
      setNewChannelName("");
      // Select the latest channel
      if (updatedChannels.length > 0) {
        setSelectedChannel(updatedChannels[updatedChannels.length - 1].id);
      }
    }
  };

  // Function to add topic to specific channel
  const handleAddTopicToChannel = async (channelId: string) => {
    if (!newTopicName.trim()) return;

    try {
      // Create topic for this channel
      const resPost = await api.post("/topics/", {
        topic_name: newTopicName.trim(),
        channel_id: Number(channelId),
        organization_id: Number(orgId),
      });
      // Unwrap created topic from response wrapper
      const createdTopic = resPost.data.data ?? resPost.data;
      setNewTopicName("");
      setAddingTopicToChannel(null); // Close the form

      // Reload topics list for this channel
      const topicsResponse = await api.get(
        `/topics/topics_in_channel?channel_id=${channelId}`
      );
      // Unwrap list from possible wrapper
      const rawTopics = Array.isArray(topicsResponse.data)
        ? topicsResponse.data
        : topicsResponse.data.data ?? [];
      const normalizedTopics = rawTopics.map((t: any) => ({
        ...t,
        id: String(t.id ?? t.topic_id),
        topic_name: t.topic_name,
        channel_id: channelId,
      }));
      setChannelTopics((prev) => ({
        ...prev,
        [channelId]: normalizedTopics,
      }));
      // Select the newly created topic if in current channel
      if (channelId === selectedChannel) {
        setSelectedTopic(String(createdTopic.id ?? createdTopic.topic_id));
      }
    } catch (error: any) {
      console.warn("Error adding topic (allowing duplicates):", error);
      // Reload topics even on error to reflect any created topic
      try {
        const topicsResponse = await api.get(
          `/topics/topics_in_channel?channel_id=${channelId}`
        );
        const rawTopics = Array.isArray(topicsResponse.data)
          ? topicsResponse.data
          : topicsResponse.data.data ?? [];
        const normalizedTopics = rawTopics.map((t: any) => ({
          ...t,
          id: String(t.id ?? t.topic_id),
          topic_name: t.topic_name,
          channel_id: channelId,
        }));
        setChannelTopics((prev) => ({
          ...prev,
          [channelId]: normalizedTopics,
        }));
        // Auto-select latest topic
        if (normalizedTopics.length > 0) {
          setSelectedTopic(normalizedTopics[normalizedTopics.length - 1].id);
        }
      } catch (reloadError) {
        console.error("Error reloading topics after failed add:", reloadError);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTopic) return;
    try {
      // Prepare multipart/form-data for note creation
      const formData = new FormData();
      formData.append(
        "title",
        newMessage.trim().substring(0, 50) +
          (newMessage.trim().length > 50 ? "..." : "")
      );
      formData.append("content", newMessage.trim());
      formData.append("topic_id", selectedTopic);
      formData.append("organization_id", orgId);
      formData.append("content_type", "text");
      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      console.log("Sending FormData note");
      const response = await api.post("/notes/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Unwrap created note
      const createdNote = response.data.data ?? response.data;
      console.log("Note created:", createdNote);

      setNewMessage("");
      // Reload notes in topic
      const res = await api.get(
        `/notes/notes_in_topic?topic_id=${selectedTopic}`
      );
      const rawMessages = Array.isArray(res.data)
        ? res.data
        : res.data.data ?? [];
      setMessages(rawMessages as any[]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      if (error.response?.status === 422) {
        const errorDetail = error.response?.data?.detail || [];
        console.error("422 Validation error details:", errorDetail);

        // Log each validation error in detail
        errorDetail.forEach((err: any, index: number) => {
          console.error(`Validation error ${index + 1}:`, err);
          console.error(`  - Location: ${err.loc?.join(" -> ")}`);
          console.error(`  - Message: ${err.msg}`);
          console.error(`  - Type: ${err.type}`);
        });

        alert(
          `Błąd walidacji danych (422): ${JSON.stringify(errorDetail, null, 2)}`
        );
      } else {
        console.error("Error response:", error.response?.data);
        alert(`Błąd podczas wysyłania wiadomości: ${error.message}`);
      }
    }
  };

  // Function to delete a channel (subject)
  const handleDeleteChannel = async (channelId: string) => {
    if (
      !window.confirm(
        "Czy na pewno chcesz usunąć przedmiot wraz ze wszystkimi tematami i wiadomościami? Ta operacja jest nieodwracalna."
      )
    )
      return;

    setDeletingChannel(channelId);
    try {
      // First, delete all topics in this channel
      const topicsInChannel = channelTopics[channelId] || [];
      if (topicsInChannel.length > 0) {
        for (const topic of topicsInChannel) {
          try {
            await api.delete(`/topics/${topic.id}`);
          } catch (topicError) {
            console.error(`Error deleting topic ${topic.id}:`, topicError);
            // Continue with other topics even if one fails
          }
        }
      }

      // Now delete the channel
      await api.delete(`/channels/${channelId}`);

      // Reload channels
      const res = await api.get(
        `/channels/channels_in_organization?organization_id=${orgId}`
      );
      const normalizedChannels = res.data.map((c: any) => ({
        ...c,
        id: String(c.id ?? c.channel_id),
      }));
      setChannels(normalizedChannels);

      // Clear topics state for deleted channel
      setChannelTopics((prev) => {
        const newTopics = { ...prev };
        delete newTopics[channelId];
        return newTopics;
      });

      // Reset selection if needed
      if (selectedChannel === channelId) {
        setSelectedChannel(null);
        setSelectedTopic(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting channel:", error);
    } finally {
      setDeletingChannel(null);
    }
  };

  // Function to delete a topic
  const handleDeleteTopic = async (topicId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć temat?")) return;
    try {
      await api.delete(`/topics/${topicId}`);
      // Determine which channel contained this topic
      const entry = Object.entries(channelTopics).find(([, topics]) =>
        topics.some((t) => t.id === topicId)
      );
      const affectedChannelId = entry?.[0];
      if (affectedChannelId) {
        // Reload only that channel's topics
        await loadTopicsForChannel(affectedChannelId);
        // If deleted topic was selected, select first of remaining or clear
        if (selectedTopic === topicId) {
          const remaining = (channelTopics[affectedChannelId] || []).filter(
            (t) => t.id !== topicId
          );
          if (remaining.length > 0) {
            setSelectedTopic(remaining[0].id);
          } else {
            setSelectedTopic(null);
            setMessages([]);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
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
        // Unwrap wrapper if present
        const raw = Array.isArray(res.data) ? res.data : res.data.data ?? [];
        // Normalize notes into Message shape
        const normalized = (raw as any[]).map((m: any) => ({
          id: String(m.note_id ?? m.id),
          content: m.content,
          created_at: m.created_at,
          image_url: m.image_url,
          user_id: String(m.user_id),
        }));
        setMessages(normalized);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Get current user ID from localStorage
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUserId(user.id?.toString() || null);
        setCurrentUserName(user.name || user.username || user.email || "");
      } catch {
        setCurrentUserId(null);
      }
    }
  }, []);

  // Load pending invitations
  const loadPendingInvites = async () => {
    try {
      // Retrieve all sent invitations and filter for this organization
      const res = await api.get(`/organization-invitations/sent`);
      const raw = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      // Filter for current org and pending status, map invitation fields
      const invites: Invite[] = (raw as any[])
        .filter(
          (i) => String(i.organization_id) === orgId && i.status === "pending"
        )
        .map((i) => ({
          id: String(i.invitation_id),
          email: i.email,
          status: i.status,
          invited_at: i.created_at,
        }));
      setPendingInvites(invites);
    } catch (error: any) {
      // If backend does not support sent invitations endpoint, treat as no invites
      if (error.response?.status === 404) {
        setPendingInvites([]);
      } else {
        console.error("Error loading pending invites:", error);
      }
    }
  };
  useEffect(() => {
    loadPendingInvites();
  }, [orgId]);

  // Send invitation to user by email
  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      // Use API contract endpoint with query parameters
      await api.post(
        `/organization-invitations/`,
        null,
        {
          params: {
            organization_id: Number(orgId),
            email: inviteEmail.trim(),
            role: "user",
          },
        }
      );
      setInviteEmail("");
      loadPendingInvites();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      alert(
        `Nie udało się wysłać zaproszenia: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Assign colors to users based on message sender
  useEffect(() => {
    // Assign a unique color to each user encountered in messages
    let updated = false;
    const updatedColors = { ...userColors };
    messages.forEach((msg) => {
      if (!updatedColors[msg.user_id]) {
        const idx = Object.keys(updatedColors).length % colorOptions.length;
        updatedColors[msg.user_id] = colorOptions[idx];
        updated = true;
      }
    });
    if (updated) {
      setUserColors(updatedColors);
    }
  }, [messages]);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
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
            {organizationName || `Organizacja ${orgId}`}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "300px 1fr",
          },
          height: "calc(100vh - 64px)",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            borderRight: "1px solid #e0e0e0",
            backgroundColor: "#f8f9fa",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
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
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#2c3e50" }}
                >
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
                  const cid = String(ch.id ?? (ch as any).channel_id);
                  const isExpanded = expandedChannels[cid] || false;
                  const channelTopicsData = channelTopics[cid] || [];

                  return (
                    <Box key={cid} sx={{ mb: 1 }}>
                      {/* Channel Header */}
                      <ListItemButton
                        onClick={() => {
                          setSelectedChannel(cid);
                          toggleChannelExpansion(cid);
                        }}
                        sx={{
                          borderRadius: 2,
                          backgroundColor:
                            selectedChannel === cid ? "#e3f2fd" : "transparent",
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
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
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600 }}
                              >
                                {ch.channel_name}
                              </Typography>
                              <Chip
                                label={channelTopicsData.length}
                                size="small"
                                sx={{
                                  minWidth: 20,
                                  height: 20,
                                  fontSize: "0.7rem",
                                  backgroundColor: "#2c3e50",
                                  color: "white",
                                }}
                              />
                            </Box>
                          }
                        />
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingTopicToChannel(cid);
                            // Ensure the channel is expanded when adding a topic
                            setExpandedChannels((prev) => ({
                              ...prev,
                              [cid]: true,
                            }));
                          }}
                          sx={{
                            mr: 1,
                            color: "#27ae60",
                            "&:hover": {
                              backgroundColor: "#27ae60",
                              color: "white",
                            },
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChannel(cid);
                          }}
                          disabled={deletingChannel === cid}
                          sx={{
                            color: "#e74c3c",
                            "&:hover": {
                              backgroundColor: "#e74c3c",
                              color: "white",
                            },
                          }}
                        >
                          {deletingChannel === cid ? (
                            <HourglassEmptyIcon fontSize="small" />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </ListItemButton>

                      {/* Topics List - Collapsible */}
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List sx={{ pl: 2, py: 0 }}>
                          {/* Add Topic Form */}
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
                                onChange={(e) =>
                                  setNewTopicName(e.target.value)
                                }
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddTopicToChannel(cid);
                                  }
                                  if (e.key === "Escape") {
                                    setAddingTopicToChannel(null);
                                    setNewTopicName("");
                                  }
                                }}
                                sx={{ mb: 1 }}
                                autoFocus
                              />
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleAddTopicToChannel(cid)}
                                  startIcon={<AddIcon />}
                                  sx={{
                                    backgroundColor: "#27ae60",
                                    "&:hover": { backgroundColor: "#219a52" },
                                  }}
                                >
                                  Dodaj
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setAddingTopicToChannel(null);
                                    setNewTopicName("");
                                  }}
                                >
                                  Anuluj
                                </Button>
                              </Box>
                            </Box>
                          )}

                          {channelTopicsData.map((topic) => (
                            <Box
                              key={topic.id}
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <ListItemButton
                                onClick={() => handleTopicClick(topic, ch)}
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
                                  handleDeleteTopic(topic.id);
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
            <CardActions sx={{ p: 2, backgroundColor: "white" }}>
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
                  backgroundColor: "#2c3e50",
                  "&:hover": { backgroundColor: "#34495e" },
                }}
              >
                Dodaj
              </Button>
            </CardActions>

            {/* Invitations Section in Sidebar */}
            <Box
              sx={{
                p: 2,
                backgroundColor: "white",
                borderTop: "1px solid #e0e0e0",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 600, color: "#2c3e50" }}
              >
                Zaproszenia
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Email użytkownika"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendInvite()}
                />
                <IconButton
                  onClick={() => handleSendInvite()}
                  sx={{
                    color: "#3498db",
                    "&:hover": { backgroundColor: "#3498db", color: "white" },
                  }}
                >
                  <PersonAddIcon fontSize="small" />
                </IconButton>
              </Box>
              {pendingInvites.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {pendingInvites.length} oczekujących zaproszeń
                </Typography>
              )}
            </Box>
          </Card>
        </Box>

        {/* Main Chat Area */}
        <Box
          sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
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
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#2c3e50" }}
                >
                  {selectedTopic
                    ? `${getCurrentChannelName()} - ${getCurrentTopicName()}`
                    : "Czat (wybierz temat)"}
                </Typography>
              }
              sx={{
                pb: 1,
                backgroundColor: "white",
                borderBottom: "1px solid #e0e0e0",
              }}
            />
            <CardContent
              sx={{
                flex: 1,
                overflowY: "auto",
                pt: 1,
                backgroundColor: "#fafafa",
              }}
            >
              {!selectedTopic ? (
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
                  const isOwn = String(msg.user_id) === currentUserId;
                  return (
                    <Box
                      key={msg.id}
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: isOwn ? "flex-start" : "flex-end",
                        alignItems: "flex-start",
                        mb: 2,
                        gap: 1,
                      }}
                    >
                      {/* Avatar for non-own messages */}
                      {!isOwn && (
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor:
                              userColors[msg.user_id] ?? "#bdbdbd",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {getUserInitials(msg.user_id)}
                        </Avatar>
                      )}

                      {/* Message Bubble */}
                      <Box
                        sx={{
                          p: 2,
                          maxWidth: "70%",
                          width: "auto",
                          backgroundColor: userColors[msg.user_id] ?? "#e0e0e0",
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

                      {/* Avatar and delete for own messages */}
                      {isOwn && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteMessage(msg.id)}
                            sx={{
                              opacity: 0.6,
                              "&:hover": {
                                backgroundColor: "#e74c3c",
                                color: "white",
                                opacity: 1,
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor:
                                userColors[msg.user_id] ?? "#bdbdbd",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {getUserInitials(msg.user_id)}
                          </Avatar>
                        </>
                      )}
                    </Box>
                  );
                })
              )}
            </CardContent>
            <Divider />
            <CardActions
              sx={{
                p: 2,
                flexDirection: "column",
                gap: 1,
                backgroundColor: "white",
              }}
            >
              {/* File Preview */}
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
                    onClick={() => setSelectedFile(null)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#e74c3c",
                        color: "white",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {/* Message Input Row */}
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder={
                    selectedTopic
                      ? "Napisz wiadomość..."
                      : "Wybierz temat aby pisać wiadomości"
                  }
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && selectedTopic && handleSendMessage()
                  }
                  disabled={!selectedTopic}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                    },
                  }}
                />

                {/* File Upload Button */}
                <input
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                  style={{ display: "none" }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload">
                  <IconButton
                    component="span"
                    sx={{
                      color: "#7f8c8d",
                      "&:hover": {
                        backgroundColor: "#ecf0f1",
                        color: "#2c3e50",
                      },
                    }}
                  >
                    <AttachFileIcon />
                  </IconButton>
                </label>

                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!selectedTopic || !newMessage.trim()}
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
        </Box>
      </Box>
    </Box>
  );
}
