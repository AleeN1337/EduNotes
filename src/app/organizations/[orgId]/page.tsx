"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Container,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Divider,
  Snackbar,
  Alert,
  Drawer,
  IconButton,
  Badge,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import Avatar from "@mui/material/Avatar";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ConfirmDialog from "@/components/common/ConfirmDialog";
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
  // Organization members & roles
  const [members, setMembers] = useState<
    {
      user_id: string;
      email?: string;
      username?: string;
      role?: string;
    }[]
  >([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  // Toast (snackbar) state
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info" | "warning";
  }>({ open: false, msg: "", sev: "info" });
  const showToast = (
    msg: string,
    sev: "success" | "error" | "info" | "warning" = "info"
  ) => setToast({ open: true, msg, sev });

  // Confirm dialog state
  const [confirmCfg, setConfirmCfg] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: "", onConfirm: () => {} });

  // Task management state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [tasksOpen, setTasksOpen] = useState(false);
  // Access control states
  const [orgNotFound, setOrgNotFound] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [redirectScheduled, setRedirectScheduled] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Pastel color palette for users (stable ordering)
  const colorOptions = [
    "#FFB3BA",
    "#FFDFBA",
    "#FFFFBA",
    "#BAFFC9",
    "#BAE1FF",
    "#E3BAFF",
    "#FFCFE3",
    "#CFF5FF",
  ];

  // Helper: user initials (prefer email local part if email)
  const getUserInitials = (userId: string) => {
    const name = userNames[userId] || "";
    if (!name) return "?";
    if (name.includes("@")) {
      const local = name.split("@")[0];
      return local.substring(0, 2).toUpperCase();
    }
    const parts = name.replace(/[@_.]/g, " ").split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Load organization name (failsafe fallback to id)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get(`/organizations/${orgId}`);
        const data = res.data?.data ?? res.data;
        if (active)
          setOrganizationName(data.organization_name || data.name || "");
      } catch (e) {
        const err: any = e;
        if (err?.response?.status === 404) {
          if (active) {
            setOrgNotFound(true);
            showToast("Organizacja nie istnieje", "error");
          }
        } else if (active) {
          setOrganizationName("");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [orgId]);

  // Load members + current user role
  useEffect(() => {
    let active = true;
    setLoadingMembers(true);
    (async () => {
      try {
        const res = await api.get(`/organization_users/${orgId}`);
        const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const mapped = (raw as any[]).map((m) => ({
          user_id: String(m.user_id ?? m.id),
          email: m.email,
          username: m.username,
          role: m.role || m.user_role || m.organization_role,
        }));
        if (active) {
          setMembers(mapped);
          // Populate userNames map (id -> username/email) for chat initials/email usage
          setUserNames((prev) => {
            const next = { ...prev } as Record<string, string>;
            mapped.forEach((m) => {
              next[m.user_id] = m.username || m.email || next[m.user_id] || "";
            });
            return next;
          });

          // Enrich members missing both username & email
          const missing = mapped.filter((m) => !m.username && !m.email);
          if (missing.length > 0) {
            (async () => {
              const updated: typeof mapped = [...mapped];
              const byId: Record<string, number> = {};
              updated.forEach((m, idx) => (byId[m.user_id] = idx));
              // Try individual fetches first
              for (const m of missing) {
                try {
                  const resUser = await api.get(`/users/${m.user_id}`);
                  const u = resUser.data?.data ?? resUser.data;
                  const idx = byId[m.user_id];
                  if (idx != null) {
                    updated[idx] = {
                      ...updated[idx],
                      email: u.email || updated[idx].email,
                      username: u.username || updated[idx].username,
                    };
                  }
                } catch {
                  // ignore; will attempt bulk fallback
                }
              }
              // Bulk fallback if some still missing
              const stillMissing = updated.filter(
                (m) => !m.email && !m.username
              );
              if (stillMissing.length > 0) {
                try {
                  const resList = await api.get(`/users/`);
                  const list = Array.isArray(resList.data?.data)
                    ? resList.data.data
                    : Array.isArray(resList.data)
                    ? resList.data
                    : [];
                  stillMissing.forEach((m) => {
                    const found = list.find(
                      (u: any) => String(u.user_id || u.id) === m.user_id
                    );
                    if (found) {
                      const idx = byId[m.user_id];
                      if (idx != null) {
                        updated[idx] = {
                          ...updated[idx],
                          email: found.email || updated[idx].email,
                          username: found.username || updated[idx].username,
                        };
                      }
                    }
                  });
                } catch {}
              }
              // Apply enrichment if component still active
              if (active) {
                setMembers(updated);
                setUserNames((prev) => {
                  const next = { ...prev } as Record<string, string>;
                  updated.forEach((m) => {
                    if (!next[m.user_id])
                      next[m.user_id] = m.username || m.email || "";
                  });
                  return next;
                });
              }
            })();
          }
        }
        try {
          const meRes = await api.get(`/organization_users/me`);
          const meRaw = Array.isArray(meRes.data)
            ? meRes.data
            : meRes.data?.data || [];
          const orgEntry = (meRaw as any[]).find(
            (r) => String(r.organization_id) === String(orgId)
          );
          if (orgEntry && active) {
            setCurrentUserRole(
              orgEntry.role ||
                orgEntry.user_role ||
                orgEntry.organization_role ||
                null
            );
          }
        } catch {}
      } catch (e) {
        if (active) {
          setMembers([]);
          // If membership endpoint returns 404 treat as org not found (or no access)
          if ((e as any)?.response?.status === 404) {
            setOrgNotFound(true);
            showToast("Organizacja nie istnieje lub brak dostępu", "error");
          }
        }
        console.warn("Failed to load members", e);
      } finally {
        if (active) setLoadingMembers(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [orgId]);

  // Delete task handler
  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/deadlines/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast("Zadanie usunięte", "success");
    } catch (e) {
      console.error("Error deleting task", e);
      showToast("Nie udało się usunąć zadania", "error");
    }
  };

  // isOwner computed after role load
  const isOwner = (currentUserRole || "").toLowerCase() === "owner";
  // Load current user avatar once (from localStorage user if present)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.avatar_url) setAvatarUrl(u.avatar_url);
      }
    } catch {}
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.put(`/users/${currentUserId}/avatar`, formData);
      const data = res.data?.data ?? res.data;
      const newUrl = data.avatar_url || data.url || data.path || null;
      if (newUrl) {
        setAvatarUrl(newUrl);
        // Update cached user
        try {
          const raw = localStorage.getItem("user");
          if (raw) {
            const u = JSON.parse(raw);
            u.avatar_url = newUrl;
            localStorage.setItem("user", JSON.stringify(u));
          }
        } catch {}
        showToast("Avatar zaktualizowany", "success");
      } else {
        showToast("Nie udało się odczytać URL avatara", "warning");
      }
    } catch (err: any) {
      showToast(
        `Błąd uploadu avatara: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setAvatarUploading(false);
      // reset input value
      e.target.value = "";
    }
  };
  // Evaluate access: user must appear in members OR be owner (role already from membership) unless org not found
  useEffect(() => {
    if (orgNotFound) return; // separate state
    if (loadingMembers) return;
    if (!currentUserId) return; // wait until user resolves
    if (members.length === 0) return; // might still load; fallback after load
    const inOrg = members.some((m) => String(m.user_id) === String(currentUserId));
    if (!inOrg) {
      setAccessDenied(true);
      showToast("Brak dostępu do tej organizacji", "error");
    }
  }, [members, currentUserId, loadingMembers, orgNotFound]);

  // Optional redirect after denial / not found
  useEffect(() => {
    if ((accessDenied || orgNotFound) && !redirectScheduled) {
      setRedirectScheduled(true);
      setTimeout(() => {
        try { router.push("/dashboard"); } catch {}
      }, 2500);
    }
  }, [accessDenied, orgNotFound, redirectScheduled, router]);
  // Ensure only one management drawer (members / tasks) at once
  useEffect(() => {
    if (tasksOpen && manageMembersOpen) setManageMembersOpen(false);
  }, [tasksOpen, manageMembersOpen]);

  const handleRemoveMember = (memberId: string) => {
    if (!isOwner) return;
    const target = members.find((m) => m.user_id === memberId);
    setConfirmCfg({
      open: true,
      message: `Usunąć użytkownika ${
        target?.username || target?.email || memberId
      } z organizacji?`,
      onConfirm: async () => {
        try {
          await api.delete(`/organization_users/${orgId}/${memberId}`);
          setMembers((prev) => prev.filter((m) => m.user_id !== memberId));
          showToast("Użytkownik usunięty", "success");
        } catch (e) {
          showToast("Nie udało się usunąć użytkownika", "error");
        } finally {
          setConfirmCfg((c) => ({ ...c, open: false }));
        }
      },
    });
  };

  // Load channels (subjects) for organization
  useEffect(() => {
  if (accessDenied || orgNotFound) return;
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

      const createdChannelId = String(newChannel.id ?? newChannel.channel_id);
      setSelectedChannel(createdChannelId);
      // Auto-expand the newly created channel so user immediately sees topic add option
      setExpandedChannels((prev) => ({ ...prev, [createdChannelId]: true }));
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
        const lastId = updatedChannels[updatedChannels.length - 1].id;
        setSelectedChannel(lastId);
        setExpandedChannels((prev) => ({ ...prev, [lastId]: true }));
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
      // Always expand and select channel & new topic to show user result immediately
      const createdTopicId = String(createdTopic.id ?? createdTopic.topic_id);
      setExpandedChannels((prev) => ({ ...prev, [channelId]: true }));
      setSelectedChannel(channelId);
      setSelectedTopic(createdTopicId);
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
        // Auto-expand and select latest topic
        if (normalizedTopics.length > 0) {
          const lastId = normalizedTopics[normalizedTopics.length - 1].id;
          setExpandedChannels((prev) => ({ ...prev, [channelId]: true }));
          setSelectedChannel(channelId);
          setSelectedTopic(lastId);
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

        showToast(
          `Błąd walidacji (422): ${errorDetail
            .map((e: any) => e.msg)
            .join("; ")}`,
          "error"
        );
      } else {
        console.error("Error response:", error.response?.data);
        showToast(`Błąd wysyłania: ${error.message}`, "error");
      }
    }
  };

  // Function to delete a channel (subject)
  const handleDeleteChannel = async (channelId: string) => {
    const proceed = () => deleteChannelConfirmed(channelId);
    setConfirmCfg({
      open: true,
      message:
        "Czy na pewno chcesz usunąć przedmiot wraz ze wszystkimi tematami i wiadomościami? Ta operacja jest nieodwracalna.",
      onConfirm: async () => {
        await proceed();
        setConfirmCfg((c) => ({ ...c, open: false }));
      },
    });
    return;
  };
  const deleteChannelConfirmed = async (channelId: string) => {
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
    setConfirmCfg({
      open: true,
      message: "Czy na pewno chcesz usunąć temat?",
      onConfirm: async () => {
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
          showToast("Nie udało się usunąć tematu", "error");
        } finally {
          setConfirmCfg((c) => ({ ...c, open: false }));
        }
      },
    });
    return;
  };

  // Function to delete a message
  const handleDeleteMessage = async (messageId: string) => {
    setConfirmCfg({
      open: true,
      message: "Czy na pewno chcesz usunąć wiadomość?",
      onConfirm: async () => {
        try {
          await api.delete(`/notes/${messageId}`);
          if (selectedTopic) {
            setMessages(await fetchMessagesForTopic(selectedTopic));
          }
          showToast("Wiadomość usunięta", "success");
        } catch (error) {
          console.error("Error deleting message:", error);
          showToast("Nie udało się usunąć wiadomości", "error");
        } finally {
          setConfirmCfg((c) => ({ ...c, open: false }));
        }
      },
    });
    return;
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
      // Success notification with organization name and inviter info
      showToast(
        `Zaproszenie wysłane do ${inviteEmail.trim()} • Organizacja: ${
          organizationName || orgId
        } • Zapraszający: ${currentUserName || "Ty"}`,
        "success"
      );
    } catch (error: any) {
      console.error("Error sending invite:", error);
      showToast(
        `Nie udało się wysłać zaproszenia: ${
          error.response?.data?.message || error.message
        }`,
        "error"
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

  // Load deadlines for this organization (try my_deadlines, fallback to all)
  useEffect(() => {
    let active = true;
    (async () => {
      const mapSortFilter = (arr: any[]): Task[] => {
        const mapped: Task[] = (arr as any[])
          .filter((d) => String(d.organization_id) === String(orgId))
          .map((d) => ({
            id: String(d.deadline_id ?? d.id),
            title: d.event_name,
            due_date: d.event_date,
          }));
        mapped.sort(
          (a, b) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
        return mapped;
      };

      // First try: my deadlines
      try {
        const res = await api.get(`/deadlines/my_deadlines`);
        const raw = Array.isArray(res.data) ? res.data : unwrap<any[]>(res);
        if (active) setTasks(mapSortFilter(raw as any[]));
        return;
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          console.warn(
            "/deadlines/my_deadlines failed, trying /deadlines/",
            err
          );
        }
      }

      // Fallback: all deadlines
      try {
        const res2 = await api.get(`/deadlines/`);
        const raw2 = Array.isArray(res2.data) ? res2.data : unwrap<any[]>(res2);
        if (active) setTasks(mapSortFilter(raw2 as any[]));
      } catch (err2) {
        if (active) setTasks([]);
        console.error("Error loading deadlines (fallback):", err2);
      }
    })();
    return () => {
      active = false;
    };
  }, [orgId]);

  // One-time migration of any old localStorage tasks into backend deadlines
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = `tasks_${orgId}`;
    const migratedKey = `tasks_migrated_${orgId}`;
    try {
      const already = localStorage.getItem(migratedKey);
      if (already) return;
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const arr: any[] = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) {
        localStorage.setItem(migratedKey, "1");
        return;
      }
      (async () => {
        for (const t of arr) {
          try {
            const body = new URLSearchParams({
              event_type: "Zadanie",
              event_name: String(t.title ?? "Zadanie"),
              event_description: "",
              event_date: new Date(String(t.due_date)).toISOString(),
              organization_id: String(orgId),
            }).toString();
            await api.post(`/deadlines/`, body, {
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
          } catch (e) {
            console.warn("Migration of a local task failed:", e);
          }
        }
        localStorage.setItem(migratedKey, "1");
        // Refresh deadlines after migration
        try {
          const res = await api.get(`/deadlines/my_deadlines`);
          const raw = Array.isArray(res.data) ? res.data : unwrap<any[]>(res);
          const mapped = (raw as any[])
            .filter((d) => String(d.organization_id) === String(orgId))
            .map((d) => ({
              id: String(d.deadline_id ?? d.id),
              title: d.event_name,
              due_date: d.event_date,
            })) as Task[];
          mapped.sort(
            (a, b) =>
              new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          );
          setTasks(mapped);
        } catch {}
      })();
    } catch (e) {
      console.warn("Local tasks migration skipped due to error:", e);
    }
  }, [orgId]);

  // Add new task handler using POST /deadlines/ (form-encoded per API)
  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !newTaskDate || !newTaskTime) {
      setTaskError("Wszystkie pola są wymagane.");
      return;
    }
    setTaskError("");
    const dueDateTime = `${newTaskDate}T${newTaskTime}`;
    try {
      const body = new URLSearchParams({
        event_type: "Zadanie",
        event_name: newTaskTitle.trim(),
        event_description: "",
        event_date: new Date(dueDateTime).toISOString(),
        organization_id: String(orgId),
      }).toString();
      const res = await api.post(`/deadlines/`, body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const d = res.data?.data ?? res.data;
      const created: Task = {
        id: String(d.deadline_id ?? d.id),
        title: d.event_name,
        due_date: d.event_date,
      };
      setTasks((prev) => [...prev, created]);
      setNewTaskTitle("");
      setNewTaskDate("");
      setNewTaskTime("");
      setAddingTask(false);
    } catch (err) {
      console.error("Error creating deadline:", err);
      setTaskError("Nie udało się dodać zadania");
    }
  };

  return (
    <>
      {(orgNotFound || accessDenied) && (
        <Box sx={{ height: "100vh", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center' }}>
            {orgNotFound ? 'Ta organizacja nie istnieje.' : 'Brak dostępu do organizacji.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Zostaniesz przekierowany na pulpit za chwilę.
          </Typography>
          <Button variant="contained" onClick={() => router.push('/dashboard')}>Przejdź do pulpitu</Button>
        </Box>
      )}
      {!orgNotFound && !accessDenied && (
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
            {/* Tasks drawer trigger (visible to all) */}
            <IconButton
              aria-label="Zadania"
              onClick={() => setTasksOpen(true)}
              sx={{ color: "white", mr: isOwner ? 1 : 0, position: 'relative' }}
            >
              <Badge
                badgeContent={tasks.length}
                color="secondary"
                overlap="circular"
                invisible={tasks.length === 0}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    height: 16,
                    minWidth: 16,
                    px: 0.5,
                  }
                }}
              >
                <AssignmentIcon />
              </Badge>
            </IconButton>
            {/* Members drawer trigger (owner only) */}
            {isOwner && (
              <IconButton
                aria-label="Zarządzaj członkami"
                onClick={() => setManageMembersOpen(true)}
                sx={{ color: "white" }}
              >
                <PeopleIcon />
              </IconButton>
            )}
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
            sx={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Tasks moved to Drawer */}

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
  )}
      {/* Drawer for member management */}
      {/* Drawer for tasks management */}
      <Drawer
        anchor="right"
        open={tasksOpen}
        onClose={() => setTasksOpen(false)}
        PaperProps={{
          sx: {
            width: 380,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18 }}>
            Zadania
          </Typography>
        </Box>
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
        <Button onClick={() => setTasksOpen(false)} fullWidth>
          Zamknij
        </Button>
      </Drawer>
      
      {/* Drawer for member management */}
      <Drawer
        anchor="right"
        open={manageMembersOpen}
        onClose={() => setManageMembersOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          },
        }}
      >
        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
          Członkowie ({members.length})
        </Typography>
        {currentUserId && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              my: 1,
              p: 1,
              border: '1px dashed #ccc',
              borderRadius: 1,
            }}
          >
            <Avatar src={avatarUrl || undefined} sx={{ width: 48, height: 48 }}>
              {!avatarUrl && getUserInitials(currentUserId)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Twój avatar
              </Typography>
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<CloudUploadIcon fontSize="small" />}
                disabled={avatarUploading}
              >
                {avatarUploading ? 'Wysyłanie...' : 'Zmień'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </Button>
            </Box>
          </Box>
        )}
        {loadingMembers && (
          <Typography variant="caption" color="text.secondary">
            Ładowanie...
          </Typography>
        )}
        <Box sx={{ flex: 1, overflow: "auto", mt: 1 }}>
          {members.map((m) => (
            <Box
              key={m.user_id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
                backgroundColor: "#fafafa",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                px: 1,
                py: 0.75,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                  {m.username || m.email || "(brak email)"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {m.role || "member"}
                </Typography>
              </Box>
              {isOwner && m.user_id !== currentUserId && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleRemoveMember(m.user_id)}
                  sx={{ textTransform: "none" }}
                >
                  Usuń
                </Button>
              )}
            </Box>
          ))}
          {!loadingMembers && members.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              Brak członków
            </Typography>
          )}
        </Box>

        <Button
          onClick={() => setManageMembersOpen(false)}
          fullWidth
          sx={{ mt: 1 }}
        >
          Zamknij
        </Button>
      </Drawer>
      <ConfirmDialog
        open={confirmCfg.open}
        message={confirmCfg.message}
        onConfirm={confirmCfg.onConfirm}
        onClose={() => setConfirmCfg((c) => ({ ...c, open: false }))}
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        severity="danger"
      />
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={toast.sev}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ fontSize: "0.9rem" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
