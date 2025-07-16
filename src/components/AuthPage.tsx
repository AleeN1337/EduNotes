"use client";

import { useState } from "react";
import { Container, Box, Fade } from "@mui/material";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  const handleAuthSuccess = () => {
    // Tutaj będzie redirect do dashboardu lub reload
    window.location.reload();
  };

  const switchToRegister = () => setMode("register");
  const switchToLogin = () => setMode("login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center p-4">
      <Container maxWidth="sm">
        <Box className="flex flex-col items-center">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black tracking-tight text-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text drop-shadow-lg">
              EduNotes
            </h1>
            <p className="text-lg text-gray-600">
              Platforma do współdzielenia notatek studenckich
            </p>
          </div>

          {/* Auth Forms */}
          <div className="w-full">
            <Fade in={mode === "login"} timeout={300}>
              <div style={{ display: mode === "login" ? "block" : "none" }}>
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToRegister={switchToRegister}
                />
              </div>
            </Fade>

            <Fade in={mode === "register"} timeout={300}>
              <div style={{ display: mode === "register" ? "block" : "none" }}>
                <RegisterForm
                  onSuccess={handleAuthSuccess}
                  onSwitchToLogin={switchToLogin}
                />
              </div>
            </Fade>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2025 EduNotes. Projekt studencki.</p>
          </div>
        </Box>
      </Container>
    </div>
  );
}
