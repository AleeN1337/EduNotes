"use client";

import React, { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Container,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Divider,
} from "@mui/material";
// Icons are encapsulated in child components now
import api from "@/lib/api";
import { unwrap, normalizeId } from "@/lib/http";
import { UserOrganization } from "@/lib/profile";
import { AuthAPI } from "@/lib/authApiWithFallback";
// Child components
import Sidebar from "@/components/organization/Sidebar";
import TasksCard from "@/components/organization/TasksCard";
import ChatArea from "@/components/organization/ChatArea";
import {
  Channel,
  Topic,
  Message,
  Invite,
  Task,
} from "@/components/organization/types";

// Types moved to shared file

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
  const [messageRatings, setMessageRatings] = useState<
    Record<string, { liked: boolean; disliked: boolean }>
  >({});
  const ratingsKey = `messageRatings_${orgId}`;
  const [activeTab, setActiveTab] = useState(0);
  const [addingTopicToChannel, setAddingTopicToChannel] = useState<
    string | null
  >(null);
  const [deletingChannel, setDeletingChannel] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [userColors, setUserColors] = useState<Record<string, string>>({});

  // Tasks state stored in localStorage per organization
  const storageKey = `tasks_${orgId}`;
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [addingTask, setAddingTask] = useState(false);
  const [taskError, setTaskError] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");

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

  // Delete task handler
  const handleDeleteTask = (taskId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć to zadanie?")) return;
    const updated = tasks.filter((t: Task) => t.id !== taskId);
    setTasks(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving tasks to localStorage:", err);
    }
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
        const raw = Array.isArray(res.data) ? res.data : unwrap<any[]>(res);
        const normalizedChannels = (raw as any[]).map((c: any) => ({
          ...c,
          id: normalizeId(c, ["id", "channel_id"]),
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
      const raw = Array.isArray(res.data) ? res.data : unwrap<any[]>(res);
      const normalizedTopics: Topic[] = (raw as any[]).map((t: any) => ({
        id: normalizeId(t, ["id", "topic_id"]),
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

  // Helpers to map/fetch messages
  const mapNotesToMessages = (raw: any[]): Message[] =>
    (raw as any[]).map((m: any) => {
      const possibleUrl =
        m.image_url ||
        m.image ||
        m.file_url ||
        m.file ||
        m.attachment_url ||
        m.attachment ||
        m.media_url;
      let image_url: string | undefined;
      if (possibleUrl) {
        const urlStr = String(possibleUrl);
        image_url = urlStr.startsWith("http")
          ? urlStr
          : `/api/backend${urlStr.startsWith("/") ? "" : "/"}${urlStr}`;
      }
      return {
        id: normalizeId(m, ["note_id", "id"]),
        content: m.content,
        created_at: m.created_at,
        image_url,
        content_type: m.content_type || m.type || undefined,
        user_id: normalizeId(m, ["user_id"]),
        likes: typeof m.likes === "number" ? m.likes : 0,
        dislikes: typeof m.dislikes === "number" ? m.dislikes : 0,
      } as Message;
    });

  async function fetchMessagesForTopic(topicId: string) {
    const res = await api.get(`/notes/notes_in_topic?topic_id=${topicId}`);
    const raw = Array.isArray(res.data) ? res.data : unwrap<any[]>(res);
    const mapped = mapNotesToMessages(raw);
    mapped.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return mapped;
  }

  // Load messages when topic selected
  useEffect(() => {
    if (selectedTopic) {
      fetchMessagesForTopic(selectedTopic)
        .then(setMessages)
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
      fetchMessagesForTopic(selectedTopic)
        .then(setMessages)
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

  async function handleAddChannel() {
    if (!newChannelName.trim()) return;
    try {
      const response = await api.post(`/channels/`, {
        channel_name: newChannelName.trim(),
        organization_id: Number(orgId),
      });

      const newChannel = response.data.data ?? response.data;
      setNewChannelName("");

      const channelsResponse = await api.get(
        `/channels/channels_in_organization?organization_id=${orgId}`
      );

      const rawChannels = Array.isArray(channelsResponse.data)
        ? channelsResponse.data
        : unwrap<any[]>(channelsResponse);
      const updatedChannels = (rawChannels as any[]).map((c: any) => ({
        ...c,
        id: normalizeId(c, ["id", "channel_id"]),
      }));
      setChannels(updatedChannels);

      setSelectedChannel(String(newChannel.id ?? newChannel.channel_id));
    } catch (error: any) {
      console.warn("Error adding channel (allowing duplicates):", error);

      const channelsResponse = await api.get(
        `/channels/channels_in_organization?organization_id=${orgId}`
      );
      const rawChannels = Array.isArray(channelsResponse.data)
        ? channelsResponse.data
        : unwrap<any[]>(channelsResponse);
      const updatedChannels = (rawChannels as any[]).map((c: any) => ({
        ...c,
        id: normalizeId(c, ["id", "channel_id"]),
      }));
      setChannels(updatedChannels);
      setNewChannelName("");

      if (updatedChannels.length > 0) {
        setSelectedChannel(updatedChannels[updatedChannels.length - 1].id);
      }
    }
  }

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
        : unwrap<any[]>(topicsResponse);
      const normalizedTopics = rawTopics.map((t: any) => ({
        ...t,
        id: normalizeId(t, ["id", "topic_id"]),
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
          : unwrap<any[]>(topicsResponse);
        const normalizedTopics = rawTopics.map((t: any) => ({
          ...t,
          id: normalizeId(t, ["id", "topic_id"]),
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
    // Allow sending when either text or a file is provided
    if ((!newMessage.trim() && !selectedFile) || !selectedTopic) return;
    try {
      // Prepare multipart/form-data for note creation
      const formData = new FormData();
      const hasText = newMessage.trim().length > 0;
      const titleBase = hasText
        ? newMessage.trim()
        : selectedFile?.name || "Załącznik";
      const titleShort =
        titleBase.substring(0, 50) + (titleBase.length > 50 ? "..." : "");
      formData.append("title", titleShort);
      // For file-only messages, use filename as content fallback
      formData.append(
        "content",
        hasText ? newMessage.trim() : selectedFile?.name || "Załącznik"
      );
      formData.append("topic_id", selectedTopic);
      formData.append("organization_id", orgId);
      // Set content type according to payload
      const fileIsImage =
        selectedFile && selectedFile.type?.startsWith("image/");
      formData.append(
        "content_type",
        hasText ? "text" : fileIsImage ? "image" : "file"
      );
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
      setSelectedFile(null);
      // Reload notes in topic
      setMessages(await fetchMessagesForTopic(selectedTopic));
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
      const raw = Array.isArray(res.data) ? res.data : unwrap<any[]>(res);
      const normalizedChannels = (raw as any[]).map((c: any) => ({
        ...c,
        id: normalizeId(c, ["id", "channel_id"]),
      }));
      setChannels(normalizedChannels);

      // Clear topics state for deleted channel
      setChannelTopics((prev) => {
        const newTopics = { ...prev } as Record<string, Topic[]>;
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
        setMessages(await fetchMessagesForTopic(selectedTopic));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Resolve current user robustly to keep chat alignment consistent for all users
  useEffect(() => {
    // load message ratings
    try {
      const stored = JSON.parse(localStorage.getItem(ratingsKey) || "{}");
      setMessageRatings(stored);
    } catch {}

    let active = true;
    (async () => {
      try {
        const user = await AuthAPI.getCurrentUser();
        if (!active) return;
        if (user && user.id) {
          setCurrentUserId(String(user.id));
          setCurrentUserName(
            (user as any).name || user.username || user.email || ""
          );
          // Ensure localStorage is up-to-date with a stable id
          try {
            localStorage.setItem("user", JSON.stringify(user));
          } catch {}
          return; // done
        }
      } catch {}

      // Fallback to localStorage if API didn't resolve
      try {
        const userJson = localStorage.getItem("user");
        if (userJson) {
          const u = JSON.parse(userJson);
          if (u?.id) {
            setCurrentUserId(String(u.id));
            setCurrentUserName(u.name || u.username || u.email || "");
          } else {
            setCurrentUserId(null);
          }
        }
      } catch {
        setCurrentUserId(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [ratingsKey]);

  // Load pending invitations
  const loadPendingInvites = async () => {
    try {
      // Retrieve all sent invitations and filter for this organization
      const res = await api.get(`/organization-invitations/sent`);
      const raw = Array.isArray(res.data) ? res.data : unwrap<any[]>(res);
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
      await api.post(`/organization-invitations/`, null, {
        params: {
          organization_id: Number(orgId),
          email: inviteEmail.trim(),
          role: "user",
        },
      });
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
    const updatedColors = { ...userColors } as Record<string, string>;
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

  // No need to fetch tasks, load from localStorage on org change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setTasks(stored ? JSON.parse(stored) : []);
    } catch (err) {
      console.error("Error loading tasks from localStorage:", err);
    }
  }, [orgId]);

  // Add new task handler storing locally
  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskDate || !newTaskTime) {
      setTaskError("Wszystkie pola są wymagane.");
      return;
    }
    setTaskError("");
    const dueDateTime = `${newTaskDate}T${newTaskTime}`;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      due_date: dueDateTime,
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving tasks to localStorage:", err);
    }
    setNewTaskTitle("");
    setNewTaskDate("");
    setNewTaskTime("");
    setAddingTask(false);
  };

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
          <Sidebar
            channels={channels}
            expanded={expandedChannels}
            channelTopics={channelTopics}
            selectedChannel={selectedChannel}
            selectedTopic={selectedTopic}
            addingTopicToChannel={addingTopicToChannel}
            deletingChannel={deletingChannel}
            newChannelName={newChannelName}
            newTopicName={newTopicName}
            onToggleChannel={(id) => {
              setSelectedChannel(id);
              toggleChannelExpansion(id);
            }}
            onSelectTopic={handleTopicClick}
            onSetAddingTopicToChannel={setAddingTopicToChannel}
            onChangeTopicName={setNewTopicName}
            onAddTopicToChannel={handleAddTopicToChannel}
            onDeleteTopic={handleDeleteTopic}
            onDeleteChannel={handleDeleteChannel}
            onChangeChannelName={setNewChannelName}
            onAddChannel={handleAddChannel}
            inviteEmail={inviteEmail}
            onChangeInviteEmail={setInviteEmail}
            onSendInvite={handleSendInvite}
            pendingInvitesCount={pendingInvites.length}
            invites={pendingInvites}
          />
        </Box>

        {/* Main Chat Area */}
        <Box
          sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          {/* Zadania */}
          <TasksCard
            tasks={tasks}
            onDelete={handleDeleteTask}
            onOpenAdd={() => setAddingTask(true)}
            adding={addingTask}
            onCloseAdd={() => setAddingTask(false)}
            newTaskTitle={newTaskTitle}
            newTaskDate={newTaskDate}
            newTaskTime={newTaskTime}
            onChangeTitle={setNewTaskTitle}
            onChangeDate={setNewTaskDate}
            onChangeTime={setNewTaskTime}
            onSubmit={() => handleAddTask()}
            error={taskError}
          />
          {/* End Zadania section */}

          {/* Main Chat Area */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <ChatArea
              title={
                selectedTopic
                  ? `${getCurrentChannelName()} - ${getCurrentTopicName()}`
                  : "Czat (wybierz temat)"
              }
              messages={messages}
              currentUserId={currentUserId}
              userColors={userColors}
              getUserInitials={getUserInitials}
              selectedFile={selectedFile}
              onRemoveFile={() => setSelectedFile(null)}
              newMessage={newMessage}
              onChangeMessage={setNewMessage}
              canSend={Boolean(selectedTopic)}
              onSend={handleSendMessage}
              onDeleteMessage={handleDeleteMessage}
              onFileSelect={handleFileSelect}
              messageRatings={messageRatings}
              setMessageRatings={setMessageRatings}
              ratingsKey={ratingsKey}
              topicId={selectedTopic}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
