"use client";

import { useState } from "react";
import { Container, Box, Fade, Button, Card } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import { Login } from "@mui/icons-material";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    // Main container with responsive design
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center p-4">
      <Container maxWidth="md">
        <Box className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full">
              <h1 className=" text-5xl font-black text-transparent bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text mb-5">
                EduNotes
              </h1>
              <p className="text-lg bg-gradient-to-br from-gray-600 to-blue-900 bg-clip-text text-transparent mt-4">
                Platforma do współdzielenia notatek
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={mode}
                  className="mt-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                ></motion.p>
              </AnimatePresence>
              <Card className="mt-6 shadow-2xl overflow-hidden">
                <div className="flex relative">
                  {/* Lewa kolumna - animowana */}
                  <motion.div
                    className="w-1/2 bg-gradient-to-br from-blue-300 to-purple-400 text-white p-8 flex flex-col justify-center absolute top-0 left-0 min-h-full"
                    animate={{
                      x: mode === "login" ? 0 : "100%",
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-3xl font-bold mb-4">
                          {mode === "login" ? "Zaloguj się" : "Dołącz do nas"}
                        </h2>
                        <p className="text-lg opacity-80">
                          {mode === "login"
                            ? "Zaloguj się do swojego konta"
                            : "Wypełnij formularz rejestracyjny"}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>

                  {/* Prawa kolumna - animowana */}
                  <motion.div
                    className="w-1/2 bg-white p-8 flex flex-col justify-center absolute top-0 right-0 min-h-full"
                    animate={{
                      x: mode === "login" ? 0 : "-100%",
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {mode === "login" ? (
                          <LoginForm
                            onSuccess={() => {
                              window.location.reload();
                            }}
                            onSwitchToRegister={() => setMode("register")}
                          />
                        ) : (
                          <RegisterForm
                            onSuccess={() => {
                              window.location.reload();
                            }}
                            onSwitchToLogin={() => setMode("login")}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>

                  {/* Spacer div to set height - niewidoczny, definiuje wysokość */}
                  <div className="w-1/2 invisible p-8">
                    {mode === "login" ? (
                      <LoginForm
                        onSuccess={() => {}}
                        onSwitchToRegister={() => {}}
                      />
                    ) : (
                      <RegisterForm
                        onSuccess={() => {}}
                        onSwitchToLogin={() => {}}
                      />
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </Box>
      </Container>
    </div>
  );
}
