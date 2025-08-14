"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { AuthAPI } from "@/lib/authApiWithFallback";
import {
  ProfileAPI,
  UserStats,
  UserOrganization,
  ChangePasswordData,
} from "@/lib/profile";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { Typewriter } from "react-simple-typewriter";
import api from "@/lib/api";

import {
  DashboardHeader,
  ProfileDrawer,
  CreateOrganizationDialog,
  QuickStatsCards,
  OrganizationsSection,
  UpcomingTasksCard,
  CalendarWidget,
  RecentNotesCard,
  NotificationSnackbar,
  type NotificationState,
} from "./dashboard/";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [profileTab, setProfileTab] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  // Stan dla danych profilu
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<
    UserOrganization[]
  >([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Stan dla dialogu tworzenia organizacji
  const [createOrgDialogOpen, setCreateOrgDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [creatingOrg, setCreatingOrg] = useState(false);

  // Stan dla powiadomień
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "success",
  });

  // Stan dla zaproszeń (raw)
  const [myInvites, setMyInvites] = useState<any[]>([]);
  const [orgStats, setOrgStats] = useState<
    Record<string, { members: number; channels: number }>
  >({});
  // Confirm dialog for organization deletion
  const [confirmOrg, setConfirmOrg] = useState<{
    open: boolean;
    orgId: string | null;
    orgName: string;
  }>({ open: false, orgId: null, orgName: "" });
  const [confirmOrgLoading, setConfirmOrgLoading] = useState(false);

  const router = useRouter();

  // Helper: resolve current user's numeric ID reliably (multi-strategy)
  const resolveUserId = async (): Promise<number | undefined> => {
    // 1. Direct numeric id already present
    const direct = Number((user as any)?.id);
    if (!Number.isNaN(direct) && direct > 0) return direct;

    const email = (user as any)?.email;

    // 2. Try decode JWT (auth_token) for common fields (user_id / id / sub)
    try {
      const token = localStorage.getItem("auth_token");
      if (token && token.split(".").length === 3) {
        const payloadRaw = token.split(".")[1];
        const json = JSON.parse(
          atob(payloadRaw.replace(/-/g, "+").replace(/_/g, "/"))
        );
        const jwtId = Number(json.user_id || json.id || json.sub);
        if (!Number.isNaN(jwtId) && jwtId > 0) return jwtId;
      }
    } catch (e) {
      console.warn("Dashboard: resolveUserId JWT decode failed", e);
    }

    // 3. As a last resort, check /organization_users/me (might contain memberships with user_id)
    try {
      const meRes = await api.get(`/organization_users/me`);
      const arr = Array.isArray(meRes.data?.data) ? meRes.data.data : [];
      if (arr.length > 0) {
        const anyMembership = arr.find((m: any) => m.user_id) || arr[0];
        const mid = Number(anyMembership?.user_id);
        if (!Number.isNaN(mid) && mid > 0) return mid;
      }
    } catch (e) {
      console.warn("Dashboard: resolveUserId organization_users/me failed", e);
    }

    return undefined; // give up
  };

  // Funkcja do pokazywania powiadomień
  const showNotification = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const closeNotification = () => {
    setNotification((prev: NotificationState) => ({ ...prev, open: false }));
  };

  // Ustaw flagę client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sprawdź czy użytkownik jest zalogowany
  useEffect(() => {
    if (!isClient) return;

    const checkAuth = async () => {
      try {
        console.log("Dashboard: Sprawdzam autentyfikację...");

        // Najpierw sprawdź czy mamy token
        const token = localStorage.getItem("auth_token");
        if (!token) {
          console.log("Dashboard: Brak tokena, przekierowuję do logowania");
          router.push("/");
          return;
        }

        const currentUser = await AuthAPI.getCurrentUser();

        if (currentUser) {
          console.log("Dashboard: Użytkownik zalogowany:", currentUser);
          setUser(currentUser);
        } else {
          console.log(
            "Dashboard: Nie udało się pobrać danych użytkownika, ale token istnieje"
          );
          // Spróbuj użyć użytkownika zapisanego w localStorage
          try {
            const stored = localStorage.getItem("user");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed) {
                setUser(parsed);
                showNotification("Użyto zapisanych danych profilu", "info");
                return;
              }
            }
          } catch {}

          // Jeśli brak wiarygodnych danych użytkownika – wróć do logowania
          router.push("/");
          return;
        }
      } catch (error) {
        console.error(
          "Dashboard: Błąd podczas sprawdzania autentyfikacji:",
          error
        );
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, isClient]);

  // Załaduj organizacje gdy użytkownik jest gotowy
  useEffect(() => {
    if (user && isClient) {
      loadOrganizations();
    }
  }, [user, isClient]);

  // Załaduj zaproszenia użytkownika
  const loadMyInvites = async () => {
    try {
      const res = await api.get(`/organization-invitations/my`);
      const raw = Array.isArray(res.data) ? res.data : res.data.data ?? [];
      const pending = (raw as any[]).filter((i) => i.status === "pending");
      const base = pending.map((i) => ({
        id: i.invitation_id,
        organization_id: i.organization_id,
        email: i.email,
        role: i.role,
        created_at: i.created_at,
        organization_name: i.organization_name || i.org_name || "",
        inviter:
          i.invited_by ||
          i.inviter_email ||
          i.created_by ||
          i.inviter ||
          i.sender_email ||
          i.owner_email ||
          i.email,
      }));
      // Find missing names (empty string)
      const missing = [
        ...new Set(
          base.filter((b) => !b.organization_name).map((b) => b.organization_id)
        ),
      ];
      const nameMap: Record<string, string> = {};
      if (missing.length) {
        await Promise.all(
          missing.map(async (oid) => {
            try {
              const oRes = await api.get(`/organizations/${oid}`);
              const oData = oRes.data?.data || oRes.data;
              if (oData?.organization_name)
                nameMap[String(oid)] = oData.organization_name;
            } catch {}
          })
        );
      }
      const enriched = base.map((b) => ({
        ...b,
        organization_name:
          b.organization_name ||
          nameMap[String(b.organization_id)] ||
          `Organizacja ${b.organization_id}`,
      }));
      setMyInvites(enriched);
    } catch (err: any) {
      // If endpoint not found, treat as no invites; only log unexpected errors
      if (err.response?.status !== 404) {
        console.error("Error loading my invitations:", err);
      }
      setMyInvites([]);
    }
  };
  useEffect(() => {
    if (isClient && user) loadMyInvites();
  }, [isClient, user]);

  // Enriched invites for header (with org name and inviter)
  const headerInvites = myInvites.map((inv) => ({
    id: inv.id,
    organization_id: inv.organization_id,
    organization_name:
      inv.organization_name ||
      userOrganizations.find((org) => org.id === inv.organization_id)
        ?.organization_name ||
      "",
    inviter: inv.inviter || inv.email,
  }));

  // Accept or decline invitation
  const acceptInvite = async (id: number) => {
    try {
      const inv = myInvites.find((i) => i.id === id);
      await api.post(`/organization-invitations/${id}/accept`);
      setMyInvites((prev) => prev.filter((i) => i.id !== id));
      // refresh organizations list
      loadOrganizations();
      if (inv) {
        const orgName =
          inv.organization_name ||
          userOrganizations.find((o) => o.id === inv.organization_id)
            ?.organization_name ||
          `Organizacja ${inv.organization_id}`;
        showNotification(
          `Dołączyłeś do organizacji: ${orgName} (zaproszenie od: ${
            inv.inviter || inv.email
          })`,
          "success"
        );
      } else {
        showNotification("Zaproszenie zaakceptowane", "success");
      }
    } catch {}
  };
  const declineInvite = async (id: number) => {
    try {
      const inv = myInvites.find((i) => i.id === id);
      await api.post(`/organization-invitations/${id}/decline`);
      setMyInvites((prev) => prev.filter((i) => i.id !== id));
      if (inv) {
        const orgName =
          inv.organization_name ||
          userOrganizations.find((o) => o.id === inv.organization_id)
            ?.organization_name ||
          `Organizacja ${inv.organization_id}`;
        showNotification(
          `Odrzucono zaproszenie do organizacji: ${orgName} (od: ${
            inv.inviter || inv.email
          })`,
          "info"
        );
      } else {
        showNotification("Zaproszenie odrzucone", "info");
      }
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
      router.push("/");
    } catch (error) {
      console.error("Błąd podczas wylogowania:", error);
      router.push("/");
    }
  };

  const handleProfileClick = () => {
    setProfileDrawerOpen(true);
    loadProfileData();
  };

  const loadProfileData = async () => {
    if (!user?.id) return;

    setProfileLoading(true);
    try {
      console.log("Dashboard: Loading profile data for user:", user.id);

      try {
        const profileResponse = await ProfileAPI.getUserProfile(user.id);
        if (profileResponse.success) {
          setUserProfile(profileResponse.data);
          console.log("Dashboard: Profile data loaded successfully");
        }
      } catch (error) {
        console.warn("Dashboard: Profile data not available:", error);
        setUserProfile(user);
      }

      try {
        const organizationsResponse = await ProfileAPI.getUserOrganizations();
        if (organizationsResponse.success) {
          setUserOrganizations(organizationsResponse.data);
          console.log(
            "Dashboard: Organizations data loaded successfully:",
            organizationsResponse.data
          );
        }
      } catch (error) {
        console.warn("Dashboard: Organizations data not available:", error);
        setUserOrganizations([]);
      }

      try {
        const statsResponse = await ProfileAPI.getUserStats();
        if (statsResponse.success) {
          setUserStats(statsResponse.data);
          console.log("Dashboard: Stats data loaded successfully");
        }
      } catch (error) {
        console.warn("Dashboard: Stats data not available:", error);
        setUserStats({
          totalNotes: 0,
          sharedNotes: 0,
          activeDays: 0,
          organizationCount: 0,
        });
      }
    } catch (error) {
      console.error("Dashboard: Error loading profile data:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadOrganizations = async () => {
    if (!user?.id) {
      console.log("Dashboard: No user ID, skipping organization load");
      return;
    }

    try {
      console.log(
        "Dashboard: Loading organizations for main view, user ID:",
        user.id
      );
      const organizationsResponse = await ProfileAPI.getUserOrganizations();
      console.log("Dashboard: Organizations response:", organizationsResponse);

      if (organizationsResponse.success) {
        const orgs = organizationsResponse.data;
        setUserOrganizations(orgs);
        // Fetch stats for each organization
        const stats: Record<string, { members: number; channels: number }> = {};
        await Promise.all(
          orgs.map(async (org) => {
            try {
              // Pobierz członków organizacji
              const membersPromise = api
                .get(`/organization_users/${org.id}`)
                .catch((err) => {
                  if (err.response?.status === 404) {
                    console.log(
                      `Members endpoint not available for org ${org.id}`
                    );
                    return { data: [] };
                  }
                  throw err;
                });

              // Pobierz kanały organizacji
              const channelsPromise = api
                .get(
                  `/channels/channels_in_organization?organization_id=${org.id}`
                )
                .catch((err) => {
                  if (err.response?.status === 404) {
                    console.log(
                      `Channels endpoint not available for org ${org.id}`
                    );
                    return { data: [] };
                  }
                  throw err;
                });

              const [membersRes, channelsRes] = await Promise.all([
                membersPromise,
                channelsPromise,
              ]);

              const membersRaw = Array.isArray(membersRes.data)
                ? membersRes.data
                : membersRes.data.data ?? [];
              const channelsRaw = Array.isArray(channelsRes.data)
                ? channelsRes.data
                : channelsRes.data.data ?? [];

              stats[org.id] = {
                members: membersRaw.length,
                channels: channelsRaw.length,
              };
            } catch (err) {
              console.error(`Error fetching stats for org ${org.id}:`, err);
              stats[org.id] = { members: 0, channels: 0 };
            }
          })
        );
        setOrgStats(stats);
        console.log(
          "Dashboard: Organizations updated successfully:",
          organizationsResponse.data
        );
      } else {
        console.warn(
          "Dashboard: Organizations response not successful:",
          organizationsResponse
        );
        setUserOrganizations([]);
      }
    } catch (error) {
      console.warn("Dashboard: Organizations data not available:", error);
      setUserOrganizations([]);
    }
  };

  const handleOrganizationsClick = () => {
    setCreateOrgDialogOpen(true);
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      showNotification("Podaj nazwę organizacji!", "error");
      return;
    }

    setCreatingOrg(true);
    try {
      console.log("Creating organization with name:", newOrgName.trim());
      const backendData = { organization_name: newOrgName.trim() };
      // Utwórz organizację i pobierz zwrócone ID
      const postOrgResp = await api.post("/organizations", backendData);
      const newOrgId = postOrgResp.data.data.organization_id;
      console.log("Organization created, ID:", newOrgId);
      // Spróbuj nadać użytkownikowi rolę właściciela z kilkoma próbami rozwiązywania ID
      let ownerAssigned = false;
      const headers = { "Content-Type": "application/x-www-form-urlencoded" };
      const roleBody = new URLSearchParams({ role: "owner" }).toString();

      // Try owner assignment WITHOUT user_id first (backend may infer from token)
      try {
        await api.post(
          `/organization_users/?organization_id=${newOrgId}`,
          roleBody,
          { headers }
        );
        ownerAssigned = true;
        console.log("Owner assignment succeeded without explicit user_id");
      } catch (e) {
        console.warn(
          "Owner assignment without user_id failed, will retry with user_id",
          e
        );
      }

      // Fallback attempts WITH user_id (needs resolveUserId)
      for (let attempt = 1; attempt <= 3 && !ownerAssigned; attempt++) {
        try {
          const uid = await resolveUserId();
          if (!uid) {
            console.warn(
              `Owner assignment (with user_id) attempt ${attempt}: cannot resolve user id`
            );
            await new Promise((r) => setTimeout(r, 120 * attempt));
            continue;
          }
          await api.post(
            `/organization_users/?organization_id=${newOrgId}&user_id=${uid}`,
            roleBody,
            { headers }
          );
          ownerAssigned = true;
          console.log(
            "Owner assignment with user_id succeeded (attempt",
            attempt,
            ")"
          );
        } catch (e2) {
          console.warn(
            `Owner assignment (with user_id) attempt ${attempt} failed`,
            e2
          );
          await new Promise((r) => setTimeout(r, 160 * attempt));
        }
      }
      if (!ownerAssigned) {
        showNotification(
          "Organizacja utworzona, ale nie nadano roli właściciela – odśwież stronę później.",
          "warning"
        );
      }
      // Sukces tworzenia organizacji
      showNotification(
        "Organizacja została utworzona pomyślnie! 🎉",
        "success"
      );
      setNewOrgName("");
      setCreateOrgDialogOpen(false);
      // Odśwież listę organizacji w widoku i drawerze
      await loadOrganizations();
      if (profileDrawerOpen) {
        await loadProfileData();
      }
      // Jeżeli przypisano właściciela, przenieś użytkownika bezpośrednio do nowej organizacji
      if (ownerAssigned) {
        try {
          router.push(`/organizations/${newOrgId}`);
        } catch {}
      }
    } catch (error: any) {
      console.error("Error creating organization:", error);
      showNotification(
        error.response?.data?.message || "Błąd podczas tworzenia organizacji",
        "error"
      );
      setCreatingOrg(false);
    }
  };

  const handleDeleteOrganization = (orgId: string) => {
    const orgName =
      userOrganizations.find((o) => o.id === orgId)?.organization_name || "";
    setConfirmOrg({ open: true, orgId, orgName });
  };

  const performOrganizationDeletion = async (orgId: string) => {
    setConfirmOrgLoading(true);
    let deletionSuccess = false;
    const cascadeWarnings: string[] = [];
    try {
      // Cascade (best-effort) – swallow individual errors, record warning messages
      try {
        const orgUsersRes = await api
          .get(`/organization_users/${orgId}`)
          .catch((e) => {
            if (e?.response?.status !== 404)
              cascadeWarnings.push("Członkowie organizacji");
            return { data: [] } as any;
          });
        const membersRaw = Array.isArray(orgUsersRes.data)
          ? orgUsersRes.data
          : orgUsersRes.data?.data ?? [];
        for (const membership of membersRaw) {
          const uid = membership.user_id ?? membership.userId ?? membership.id;
          if (uid != null) {
            try {
              await api.delete(`/organization_users/${orgId}/${uid}`);
            } catch {}
          }
        }
        const channelsRes = await api
          .get("/channels/channels_in_organization", {
            params: { organization_id: Number(orgId) },
          })
          .catch((e) => {
            if (e?.response?.status !== 404) cascadeWarnings.push("Kanały");
            return { data: [] } as any;
          });
        const channelList = Array.isArray(channelsRes.data)
          ? channelsRes.data
          : channelsRes.data?.data ?? [];
        for (const channel of channelList) {
          const topicsRes = await api
            .get("/topics/topics_in_channel", {
              params: { channel_id: channel.id },
            })
            .catch((e) => {
              if (e?.response?.status !== 404)
                cascadeWarnings.push(
                  `Tematy kanału ${channel.channel_name || channel.id}`
                );
              return { data: [] } as any;
            });
          const topicList = Array.isArray(topicsRes.data)
            ? topicsRes.data
            : topicsRes.data?.data ?? [];
          for (const topic of topicList) {
            const notesRes = await api
              .get("/notes/notes_in_topic", { params: { topic_id: topic.id } })
              .catch((e) => {
                if (e?.response?.status !== 404)
                  cascadeWarnings.push(
                    `Notatki tematu ${topic.topic_name || topic.id}`
                  );
                return { data: [] } as any;
              });
            const notesList = Array.isArray(notesRes.data)
              ? notesRes.data
              : notesRes.data?.data ?? [];
            for (const note of notesList) {
              try {
                await api.delete(`/notes/${note.id ?? note.note_id}`);
              } catch {}
            }
            try {
              await api.delete(`/topics/${topic.id ?? topic.topic_id}`);
            } catch {}
          }
          try {
            await api.delete(`/channels/${channel.id ?? channel.channel_id}`);
          } catch {}
        }
      } catch (cascadeError) {
        console.warn("Cascade deletion major error", cascadeError);
      }

      // Final delete (treat 404 as success – already gone)
      let deleteError: any | null = null;
      try {
        await api.delete(`/organizations/${orgId}`);
        deletionSuccess = true;
      } catch (delErr: any) {
        if (delErr?.response?.status === 404) {
          deletionSuccess = true; // already deleted
        } else {
          deleteError = delErr; // hold error for verification step
        }
      }

      // Verification step: if delete call errored, check whether org still exists
      if (!deletionSuccess && deleteError) {
        try {
          await api.get(`/organizations/${orgId}`); // If succeeds, org still exists -> throw original error
          // Organization still present => rethrow original error to outer catch
          throw deleteError;
        } catch (verifyErr: any) {
          const status = verifyErr?.response?.status;
          // If verification 404 -> treat as success (deleted despite delete error)
          if (status === 404) {
            deletionSuccess = true;
            cascadeWarnings.push(
              "(Usunięto mimo błędnej odpowiedzi serwera przy kasowaniu)"
            );
          } else if (verifyErr === deleteError) {
            // This means GET succeeded; already handled by throw above; keep for clarity
          } else {
            // Some other network error during verification: keep original error path
            throw deleteError;
          }
        }
      }

      if (deletionSuccess) {
        if (cascadeWarnings.length > 0) {
          showNotification(
            `Organizacja usunięta (część elementów pominięto: ${cascadeWarnings.join(
              ", "
            )})`,
            "warning"
          );
        } else {
          showNotification("Organizacja usunięta pomyślnie", "success");
        }
        try {
          await loadOrganizations();
        } catch {}
        if (profileDrawerOpen) {
          try {
            await loadProfileData();
          } catch {}
        }
      }
    } catch (error: any) {
      console.error("Dashboard: Error deleting organization:", error);
      showNotification("Błąd podczas usuwania organizacji", "error");
    } finally {
      setConfirmOrgLoading(false);
      setConfirmOrg({ open: false, orgId: null, orgName: "" });
    }
  };

  const handleProfileTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setProfileTab(newValue);
  };

  const handlePasswordChange = async () => {
    console.log("Dashboard: Starting password change process");

    if (!currentPassword) {
      showNotification("Podaj aktualne hasło!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification("Hasła nie są identyczne!", "error");
      return;
    }
    if (newPassword.length < 6) {
      showNotification("Hasło musi mieć co najmniej 6 znaków!", "error");
      return;
    }

    if (!user?.id) {
      showNotification("Brak danych użytkownika!", "error");
      return;
    }

    try {
      const passwordData: ChangePasswordData = {
        old_password: currentPassword,
        new_password: newPassword,
      };

      console.log(
        "Dashboard: Calling ProfileAPI.changePassword with user ID:",
        user.id
      );
      const response = await ProfileAPI.changePassword(user.id, passwordData);
      console.log("Dashboard: Password change response:", response);

      if (response.success) {
        showNotification(
          response.message || "Hasło zostało zmienione!",
          "success"
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      console.error("Dashboard: Error changing password:", error);
      showNotification(error.message || "Błąd podczas zmiany hasła!", "error");
    }
  };

  const handlePasswordFieldChange = (field: string, value: string) => {
    switch (field) {
      case "current":
        setCurrentPassword(value);
        break;
      case "new":
        setNewPassword(value);
        break;
      case "confirm":
        setConfirmPassword(value);
        break;
    }
  };

  const handleOrganizationClick = (orgId: string) => {
    router.push(`/organizations/${orgId}`);
  };

  // Akceptacja lub odrzucenie zaproszenia
  const handleAccept = async (id: number) => {
    try {
      await api.post(`/organization-invitations/${id}/accept`);
      loadMyInvites();
      // przeładuj organizacje
      loadOrganizations();
    } catch (err) {
      console.error("Error accepting invite:", err);
    }
  };
  const handleDecline = async (id: number) => {
    try {
      await api.post(`/organization-invitations/${id}/decline`);
      loadMyInvites();
    } catch (err) {
      console.error("Error declining invite:", err);
    }
  };
  // Opuszczenie organizacji przez użytkownika
  const handleLeaveOrganization = async (orgId: string) => {
    if (!user) return;
    try {
      // Najpierw znajdź poprawny user_id z /organization_users/me dla tej organizacji
      let userIdNum: number | undefined;
      try {
        const meRes = await api.get(`/organization_users/me`);
        const meArr = Array.isArray(meRes.data?.data) ? meRes.data.data : [];
        const orgIdNum = Number(orgId);
        const membership = meArr.find(
          (m: any) => Number(m.organization_id) === orgIdNum
        );
        if (membership?.user_id) {
          userIdNum = Number(membership.user_id);
        }
      } catch (e) {
        console.warn("Dashboard: fallback to resolveUserId for leave", e);
      }

      if (!userIdNum) {
        const uid = await resolveUserId();
        userIdNum = uid ?? Number(user.id);
      }

      if (!userIdNum || Number.isNaN(userIdNum)) {
        throw new Error("Nie udało się ustalić ID użytkownika");
      }

      await api.delete(`/organization_users/${Number(orgId)}/${userIdNum}`);
      // Update UI state
      setUserOrganizations((prev) => prev.filter((o) => o.id !== orgId));
      showNotification("Opuściłeś organizację", "success");
      await loadOrganizations();
    } catch (err) {
      console.error("Error leaving organization:", err);
      showNotification("Błąd przy opuszczaniu organizacji", "error");
    }
  };

  // Loading states
  if (!isClient) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography>Ładowanie...</Typography>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography>Ładowanie...</Typography>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <DashboardHeader
        user={user!}
        onProfileClick={() => setProfileDrawerOpen(true)}
        onLogout={handleLogout}
        invites={headerInvites}
        onAcceptInvite={acceptInvite}
        onDeclineInvite={declineInvite}
      />

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
            <Typewriter
              words={[
                `Witaj ponownie, ${
                  (user as any)?.username ||
                  (user as any)?.email?.split("@")[0] ||
                  "Użytkowniku"
                }! `,
              ]}
              cursor
              cursorStyle="|"
              loop={false}
              typeSpeed={100}
              delaySpeed={1000}
            />
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
          >
            Oto przegląd Twojej aktywności edukacyjnej
          </Typography>
        </Box>

        <QuickStatsCards />

        {/* Main Content Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 4,
          }}
        >
          {/* Left Column */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <RecentNotesCard />
            {/* Organizations Section */}
            <OrganizationsSection
              userOrganizations={userOrganizations}
              onCreateClick={handleOrganizationsClick}
              onOrganizationClick={handleOrganizationClick}
              onLeaveOrganization={handleLeaveOrganization}
              orgStats={orgStats}
            />
          </Box>

          {/* Right Column */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <UpcomingTasksCard
              orgIds={userOrganizations.map((o) => o.id.toString())}
            />
            <CalendarWidget />
          </Box>
        </Box>
      </Container>

      <ProfileDrawer
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        user={user}
        profileTab={profileTab}
        onTabChange={handleProfileTabChange}
        userProfile={userProfile}
        userOrganizations={userOrganizations}
        userStats={userStats}
        profileLoading={profileLoading}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        currentPassword={currentPassword}
        onPasswordChange={handlePasswordFieldChange}
        onSubmitPasswordChange={handlePasswordChange}
        onDeleteOrganization={handleDeleteOrganization}
      />

      <CreateOrganizationDialog
        open={createOrgDialogOpen}
        onClose={() => setCreateOrgDialogOpen(false)}
        newOrgName={newOrgName}
        onNameChange={setNewOrgName}
        creating={creatingOrg}
        onSubmit={handleCreateOrganization}
      />

      <NotificationSnackbar
        notification={notification}
        onClose={closeNotification}
      />
      <ConfirmDialog
        open={confirmOrg.open}
        message={`Czy na pewno chcesz usunąć organizację ${
          confirmOrg.orgName || ""
        }? Tego nie można cofnąć.`}
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        severity="danger"
        loading={confirmOrgLoading}
        onConfirm={() =>
          confirmOrg.orgId &&
          !confirmOrgLoading &&
          performOrganizationDeletion(confirmOrg.orgId)
        }
        onClose={() =>
          !confirmOrgLoading &&
          setConfirmOrg({ open: false, orgId: null, orgName: "" })
        }
      />
    </div>
  );
}
