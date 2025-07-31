"use client";

import { useState } from "react";
import {
  Container,
  Box,
  Fade,
  Button,
  Card,
  CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuthSuccess = () => {
    console.log("AuthPage: Handling auth success, redirecting to dashboard...");
    setIsLoading(true);
    // Natychmiastowe przekierowanie zamiast opóźnienia
    router.push("/dashboard");
  };

  return (
    // Main container with responsive design
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center p-2 sm:p-4">
      <Container maxWidth="md" className="md:max-w-4xl">
        <Box className=" text-center  ">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: isLoading ? 90 : 0,
            }}
            transition={{
              opacity: { duration: 0.6 },
              scale: { duration: 0.6 },
              rotateX: { duration: 1, ease: "easeInOut" },
            }}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center bottom",
            }}
          >
            <div className="w-full">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-transparent bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text">
                EduNotes
              </h1>
              <p className="text-base sm:text-lg bg-gradient-to-br from-gray-600 to-blue-900 bg-clip-text text-transparent mt-2 sm:mt-4">
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
              <Card className="mt-4 sm:mt-6 shadow-2xl">
                <div className="md:hidden">
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-300 to-purple-400 text-white text-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">
                          {mode === "login" ? "Zaloguj się" : "Dołącz do nas"}
                        </h2>
                        <p className="text-sm sm:text-base opacity-90">
                          {mode === "login"
                            ? "Wprowadź swoje dane logowania"
                            : "Wypełnij formularz rejestracyjny"}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="p-4 sm:p-8 bg-white">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {mode === "login" ? (
                          <LoginForm
                            onSuccess={handleAuthSuccess}
                            onSwitchToRegister={() => setMode("register")}
                          />
                        ) : (
                          <RegisterForm
                            onSuccess={handleAuthSuccess}
                            onSwitchToLogin={() => setMode("login")}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="hidden md:block">
                  <motion.div className="flex relative overflow-hidden">
                    {/* Lewa kolumna - animowana */}
                    <motion.div
                      className="w-1/2 bg-gradient-to-br from-blue-300 to-purple-400 text-white p-8 flex flex-col justify-center absolute top-0 left-0 h-full z-10"
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
                              ? "Wprowadź swoje dane logowania"
                              : "Wypełnij formularz rejestracyjny"}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>

                    {/* Prawa kolumna - animowana */}
                    <motion.div
                      className="w-1/2 bg-white p-8 flex flex-col justify-center absolute top-0 right-0 h-full z-10"
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
                              onSuccess={handleAuthSuccess}
                              onSwitchToRegister={() => setMode("register")}
                            />
                          ) : (
                            <RegisterForm
                              onSuccess={handleAuthSuccess}
                              onSwitchToLogin={() => setMode("login")}
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>

                    {/* Spacer div - definiuje wysokość kontenera */}
                    <div className="w-full flex">
                      <div className="w-1/2 p-8">
                        <div className="invisible">
                          <h2 className="text-3xl font-bold mb-4">
                            Placeholder
                          </h2>
                          <p className="text-lg mb-6">Placeholder text</p>
                        </div>
                      </div>
                      <div className="w-1/2 p-8">
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
                  </motion.div>
                </div>
              </Card>
            </div>
          </motion.div>
        </Box>

        {/* Ekran ładowania - pojawia się nad całym ekranem */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="fixed inset-0 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center z-50"
              style={{
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <CircularProgress
                    size={80}
                    thickness={4}
                    className="mb-6"
                    sx={{ color: "#22c55e" }}
                  />
                </motion.div>
                <motion.p
                  className="text-lg text-gray-700 font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  Logowanie...
                </motion.p>
                <motion.p
                  className="text-sm text-gray-500 mt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  Proszę czekać
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}
