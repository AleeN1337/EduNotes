"use client";

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Business as OrganizationsIcon,
  BarChart as StatsIcon,
  Lock as PasswordIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { ProfileDrawerProps } from "./types";
import { useRouter } from "next/navigation";

export default function ProfileDrawer({
  open,
  onClose,
  user,
  profileTab,
  onTabChange,
  userProfile,
  userOrganizations,
  userStats,
  profileLoading,
  newPassword,
  confirmPassword,
  currentPassword,
  onPasswordChange,
  onSubmitPasswordChange,
  onDeleteOrganization,
}: ProfileDrawerProps) {
  const router = useRouter();

  const renderProfileContent = () => {
    if (profileLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <Typography>Ładowanie danych profilu...</Typography>
        </Box>
      );
    }

    switch (profileTab) {
      case 0: // Ogólne informacje
        const profileData = userProfile || user;
        return (
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <InfoIcon />
              Informacje ogólne
            </Typography>

            <Card
              sx={{
                mb: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mr: 3,
                      background:
                        "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                      fontSize: "24px",
                      fontWeight: "bold",
                    }}
                  >
                    {profileData?.email?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {profileData?.username ||
                        (profileData?.firstName || profileData?.lastName
                          ? `${profileData.firstName} ${profileData.lastName}`
                          : profileData?.email?.split("@")[0]) ||
                        "Użytkownik"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profileData?.email}
                    </Typography>
                    <Chip
                      label="Aktywny"
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%" } }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {profileData?.email || "Brak danych"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%" } }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Nazwa użytkownika
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {profileData?.username ||
                          profileData?.email?.split("@")[0] ||
                          "Brak danych"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%" } }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Data rejestracji
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {profileData?.createdAt
                          ? new Date(profileData.createdAt).toLocaleDateString(
                              "pl-PL",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Brak danych"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%" } }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Ostatnia aktualizacja
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {profileData?.updatedAt
                          ? new Date(profileData.updatedAt).toLocaleDateString(
                              "pl-PL"
                            )
                          : "Brak danych"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case 1: // Organizacje
        return (
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <OrganizationsIcon />
              Moje organizacje
            </Typography>

            {userOrganizations && userOrganizations.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {userOrganizations.map((org, index) => (
                  <Card
                    key={index}
                    onClick={() => router.push(`/organizations/${org.id}`)}
                    sx={{
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 1 }}
                          >
                            {org.organization_name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            Członek od:{" "}
                            {org.joined_at
                              ? new Date(org.joined_at).toLocaleDateString(
                                  "pl-PL"
                                )
                              : "Brak danych"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={org.role || "Członek"}
                            color={
                              org.role === "owner" ? "primary" : "secondary"
                            }
                            sx={{ fontWeight: 500 }}
                          />
                          {org.role === "owner" && (
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteOrganization(org.id);
                              }}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Card
                sx={{
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                  <OrganizationsIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Brak organizacji
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Nie należysz jeszcze do żadnej organizacji
                  </Typography>
                  <Button variant="outlined" startIcon={<AddIcon />}>
                    Utwórz organizację
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>
        );

  case 2: // Zmiana hasła (tab: Hasło)
        return (
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PasswordIcon />
              Zmiana hasła
            </Typography>
            <Card
              sx={{
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Ustaw nowe hasło
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    label="Aktualne hasło"
                    type="password"
                    value={currentPassword}
                    onChange={(e) =>
                      onPasswordChange("current", e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    label="Nowe hasło"
                    type="password"
                    value={newPassword}
                    onChange={(e) => onPasswordChange("new", e.target.value)}
                    fullWidth
                    variant="outlined"
                    helperText="Hasło musi mieć co najmniej 6 znaków"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    label="Potwierdź nowe hasło"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      onPasswordChange("confirm", e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    error={
                      newPassword !== confirmPassword && confirmPassword !== ""
                    }
                    helperText={
                      newPassword !== confirmPassword && confirmPassword !== ""
                        ? "Hasła nie są identyczne"
                        : ""
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={onSubmitPasswordChange}
                      disabled={
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword ||
                        newPassword.length < 6
                      }
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        background:
                          "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)",
                        },
                      }}
                    >
                      Zmień hasło
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        onPasswordChange("current", "");
                        onPasswordChange("new", "");
                        onPasswordChange("confirm", "");
                      }}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                      }}
                    >
                      Wyczyść
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

  case 3: // Ustawienia (tab: Ustawienia)
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ustawienia
            </Typography>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Preferencje
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Motyw</Typography>
                    <Chip label="Jasny" size="small" />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Język</Typography>
                    <Chip label="Polski" size="small" />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Powiadomienia email</Typography>
                    <Chip label="Włączone" color="primary" size="small" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100vw", sm: 450, md: 500 },
          maxWidth: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        },
      }}
    >
      {/* Header z informacjami o użytkowniku */}
      <Box
        sx={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          p: 3,
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "white",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
              color: "white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {user?.email?.[0]?.toUpperCase() || "U"}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {user?.email?.split("@")[0] || "Użytkownik"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ opacity: 0.8, fontSize: "0.85rem" }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box
        sx={{
          background: "rgba(255, 255, 255, 0.05)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Tabs
          value={profileTab}
          onChange={onTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "white",
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
              textTransform: "none",
              fontWeight: 500,
              minHeight: 64,
              "&.Mui-selected": {
                color: "white",
              },
              "&:hover": {
                background: "rgba(255, 255, 255, 0.1)",
              },
            },
          }}
        >
          <Tab icon={<InfoIcon />} label="Ogólne" iconPosition="start" />
          <Tab
            icon={<OrganizationsIcon />}
            label="Organizacje"
            iconPosition="start"
          />
          <Tab icon={<PasswordIcon />} label="Hasło" iconPosition="start" />
          <Tab
            icon={<SettingsIcon />}
            label="Ustawienia"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          background: "rgba(255, 255, 255, 0.95)",
          color: "text.primary",
          "&::-webkit-scrollbar": {
            width: 8,
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0,0,0,0.1)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.3)",
            borderRadius: 4,
          },
        }}
      >
        {renderProfileContent()}
      </Box>
    </Drawer>
  );
}
