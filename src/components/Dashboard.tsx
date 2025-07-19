"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  AppBar,
  Toolbar,
} from "@mui/material";
import { AuthAPI } from "@/lib/authApi";
import { User } from "@/types";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!AuthAPI.isAuthenticated()) {
        router.push("/");
        return;
      }

      try {
        const currentUser = await AuthAPI.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Token wygasł lub nieprawidłowy
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await AuthAPI.logout();
    router.push("/");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>Ładowanie...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EduNotes Dashboard
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2">
              Witaj, {user.firstName}!
            </Typography>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user.firstName[0]}{user.lastName[0]}
            </Avatar>
            <Button color="inherit" onClick={handleLogout}>
              Wyloguj
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Witaj w EduNotes! Tutaj możesz zarządzać swoimi notatkami.
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Informacje o koncie
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography>
                <strong>Imię:</strong> {user.firstName}
              </Typography>
              <Typography>
                <strong>Nazwisko:</strong> {user.lastName}
              </Typography>
              <Typography>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography>
                <strong>Username:</strong> {user.username}
              </Typography>
              <Typography>
                <strong>Data rejestracji:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString("pl-PL")}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Szybkie akcje
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="primary">
              Dodaj notatkę
            </Button>
            <Button variant="outlined">
              Przeglądaj notatki
            </Button>
            <Button variant="outlined">
              Moje notatki
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
}
