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
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import ConfirmDialog from "@/components/common/ConfirmDialog";
// Icons are encapsulated in child components now
import api from "@/lib/api";
import { unwrap, normalizeId } from "@/lib/http";
import { UserOrganization } from "@/lib/profile";
import { AuthAPI } from "@/lib/authApiWithFallback";
// Child components
import Sidebar from "@/components/organization/Sidebar";
// Zadania przeniesione do menu w pasku nawigacji
import TaskMenu from "@/components/organization/TaskMenu";
import UserManagementMenu from "@/components/organization/UserManagementMenu";
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
  const [orgExists, setOrgExists] = useState<boolean | null>(null);
  const [membershipChecked, setMembershipChecked] = useState(false);
  const [membershipEnsured, setMembershipEnsured] = useState(false);
  const [ensuringMembership, setEnsuringMembership] = useState(false);

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
  // Members state
  const [members, setMembers] = useState<
    { user_id: string; email?: string; username?: string; role?: string }[]
  >([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Tasks (deadlines) stored in backend
  const [tasks, setTasks] = useState<Task[]>([]);
  const [addingTask, setAddingTask] = useState(false);
  const [taskError, setTaskError] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  // Notification state
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

  // Delete task handler (DELETE /deadlines/{id})
  const handleDeleteTask = (taskId: string) => {
    setConfirmCfg({
      open: true,
      message: "Czy na pewno chcesz usunąć to zadanie?",
      onConfirm: async () => {
        try {
          await api.delete(`/deadlines/${taskId}`);
          setTasks((prev) => prev.filter((t) => t.id !== taskId));
          showToast("Zadanie usunięte", "success");
        } catch (err) {
          console.error("Error deleting deadline:", err);
          showToast("Nie udało się usunąć zadania", "error");
        } finally {
          setConfirmCfg((c) => ({ ...c, open: false }));
        }
      },
    });
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
          setOrgExists(true);
        })
        .catch((error) => {
          console.error("Error loading organization:", error);
          setOrganizationName(`Organizacja ${orgId}`);
          if (error.response?.status === 404) setOrgExists(false);
        });
    }
  }, [orgId]);

  // Load members list
  const loadMembers = async () => {
    setMembersLoading(true);
    try {
      const extractDeepEmail = (
        obj: any,
        depth = 0,
        visited = new Set<any>()
      ): string | undefined => {
        if (!obj || typeof obj !== "object" || depth > 5 || visited.has(obj))
          return undefined;
        visited.add(obj);
        for (const val of Object.values(obj)) {
          if (typeof val === "string" && /.+@.+\..+/.test(val)) return val;
        }
        for (const val of Object.values(obj)) {
          if (val && typeof val === "object") {
            const found = extractDeepEmail(val, depth + 1, visited);
            if (found) return found;
          }
        }
        return undefined;
      };
      const res = await api.get(`/organization_users/${orgId}`).catch((e) => {
        if (e?.response?.status !== 404)
          console.warn("Error fetching members", e);
        return { data: [] } as any;
      });
      const raw = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      const mapped = (raw as any[]).map((m) => {
        const user_id = String(m.user_id ?? m.id ?? m.userId ?? "");
        // Heurystyka szukania emaila w różnych polach które backend może zwrócić
        const emailCandidate =
          m.email ||
          m.user_email ||
          m.userEmail ||
          m.email_address ||
          m.member_email ||
          m.owner_email ||
          (m.user && (m.user.email || m.user.user_email)) ||
          null;
        const usernameCandidate =
          m.username || m.user_name || (m.user && m.user.username) || null;

        let emailFinal: string | undefined = emailCandidate
          ? String(emailCandidate)
          : undefined;
        // Dodatkowa heurystyka: przeszukaj płytko wszystkie wartości string zawierające '@'
        if (!emailFinal) {
          emailFinal = extractDeepEmail(m);
        }
        // Log debug (raz na członka bez emaila) – można później usunąć
        if (!emailFinal) {
          // eslint-disable-next-line no-console
          console.debug("[Org Members] Brak emaila w rekordzie:", m);
        }
        return {
          user_id,
          email: emailFinal,
          // zachowaj username gdyby email nie był dostępny
          username: usernameCandidate ? String(usernameCandidate) : undefined,
          role: m.role || m.user_role || m.membership_role || m.type,
        };
      });
      setMembers(mapped);

      // Uzupełnianie brakujących emaili – najpierw spróbujemy masowo przez /users/ (jeśli dostępne)
      const missingIds = mapped.filter((m) => !m.email).map((m) => m.user_id);
      if (missingIds.length) {
        let userDirectory: Record<string, any> | null = null;
        try {
          // Replace bulk /users/ fetch to suppress interceptor errors
          let listRes;
          try {
            listRes = await api.get(`/users/`, { validateStatus: () => true });
          } catch (e) {
            console.warn("/users/ list fetch network error", e);
            listRes = null;
          }
          if (listRes?.status === 200 && listRes.data) {
            const listData = Array.isArray(listRes.data?.data)
              ? listRes.data.data
              : Array.isArray(listRes.data)
              ? listRes.data
              : [];
            userDirectory = {};
            for (const u of listData) {
              const uid = String(u.id ?? u.user_id ?? "");
              if (uid) userDirectory[uid] = u;
            }
          }
        } catch {}

        let updated = mapped.slice();
        if (userDirectory) {
          let changed = false;
          updated = updated.map((m) => {
            if (!m.email && userDirectory![m.user_id]) {
              const u = userDirectory![m.user_id];
              const foundEmail =
                u.email ||
                u.user_email ||
                u.email_address ||
                (u.profile && (u.profile.email || u.profile.user_email));
              if (foundEmail) {
                changed = true;
                return { ...m, email: String(foundEmail) };
              }
            }
            return m;
          });
          if (changed) setMembers(updated);
        }

        // Drugi krok: indywidualne pobrania tylko dla nadal brakujących (limit do 15 aby nie spamować)
        const stillMissing = updated.filter((m) => !m.email).slice(0, 15);
        if (stillMissing.length) {
          await Promise.all(
            stillMissing.map(async (m) => {
              let uRes;
              try {
                uRes = await api.get(`/users/${m.user_id}`, {
                  validateStatus: () => true,
                });
              } catch (e) {
                console.warn(`Network error fetching user ${m.user_id}`, e);
                return;
              }
              if (uRes?.status === 200 && uRes.data) {
                const env = uRes.data;
                const u = env?.data ?? env;
                const foundEmail =
                  u.email ||
                  u.user_email ||
                  u.email_address ||
                  (u.profile && (u.profile.email || u.profile.user_email));
                if (foundEmail) {
                  setMembers((prev) =>
                    prev.map((pm) =>
                      pm.user_id === m.user_id
                        ? { ...pm, email: String(foundEmail) }
                        : pm
                    )
                  );
                }
              } else {
                console.debug(
                  `User ${m.user_id} fetch returned status ${uRes?.status}`
                );
              }
            })
          );
        }
      }
      // Determine if current user is owner
      const token = localStorage.getItem("auth_token");
      let currentId: string | undefined;
      try {
        if (token && token.split(".").length === 3) {
          const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
          );
          const cid = payload.user_id || payload.id || payload.sub;
          if (cid) currentId = String(cid);
        }
      } catch {}
      if (!currentId) {
        try {
          const meRes = await api.get(`/organization_users/me`);
          const arr = Array.isArray(meRes.data?.data) ? meRes.data.data : [];
          const membership = arr.find(
            (m: any) => String(m.organization_id) === String(orgId)
          );
          if (membership?.user_id) currentId = String(membership.user_id);
        } catch {}
      }
      if (currentId) {
        setIsOwner(
          mapped.some(
            (m) =>
              m.user_id === currentId &&
              (m.role || "").toLowerCase() === "owner"
          )
        );
      } else {
        setIsOwner(false);
      }
    } finally {
      setMembersLoading(false);
    }
  };
  useEffect(() => {
    loadMembers();
  }, [orgId]);

  const handleRemoveMember = (uid: string) => {
    // Owner check
    if (!isOwner) return;
    if (!uid) return;
    setConfirmCfg({
      open: true,
      message: "Czy na pewno chcesz usunąć użytkownika z organizacji?",
      onConfirm: async () => {
        try {
          await api.delete(`/organization_users/${orgId}/${uid}`);
          setMembers((prev) => prev.filter((m) => m.user_id !== uid));
          showToast("Użytkownik usunięty", "success");
        } catch (e) {
          console.error("Error removing member", e);
          showToast("Nie udało się usunąć użytkownika", "error");
        } finally {
          setConfirmCfg((c) => ({ ...c, open: false }));
        }
      },
    });
  };

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

  // Remove auto-add membership logic: users must be invited to join organizations

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

  // Block view if org doesn't exist or user not member
  if (orgExists === false) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography variant="h5" color="error">
          Organizacja nie istnieje.
        </Typography>
        <Button variant="contained" onClick={() => router.push("/dashboard")}>
          Powrót do dashboardu
        </Button>
      </Box>
    );
  }
  if (
    orgExists &&
    !membersLoading &&
    currentUserId &&
    !members.some((m) => m.user_id === currentUserId)
  ) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography variant="h5" color="text.secondary">
          Nie masz dostępu do tej organizacji.
        </Typography>
        <Button variant="contained" onClick={() => router.push("/dashboard")}>
          Powrót do dashboardu
        </Button>
      </Box>
    );
  }

  return (
    <>
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
              onClick={() => router.push("/dashboard")}
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
            <TaskMenu
              tasks={tasks}
              onDelete={handleDeleteTask}
              adding={addingTask}
              onOpenAdd={() => setAddingTask(true)}
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
            <UserManagementMenu
              members={members}
              currentUserId={currentUserId}
              isOwner={isOwner}
              onRemoveMember={handleRemoveMember}
              onRefreshMembers={loadMembers}
              loading={membersLoading}
            />
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
            {/* Zadania przeniesione do TaskMenu w AppBar */}

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
