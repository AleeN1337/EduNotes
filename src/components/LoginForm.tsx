"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";
import { loginSchema, LoginFormData } from "@/lib/validationSchemas";
import { AuthAPI } from "@/lib/authApiWithFallback";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
}: LoginFormProps) {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError("");

      // Wywołanie API
      console.log("Attempting login with:", data.email);
      const result = await AuthAPI.login(data);
      console.log("Login result:", result);

      if (result && result.success !== false) {
        console.log("Login successful, calling onSuccess");
        onSuccess?.();
      } else {
        console.log("Login failed - no valid result");
        setError("Logowanie nie powiodło się");
      }
    } catch (err) {
      console.log("Login error:", err);
      setError(
        err instanceof Error ? err.message : "Wystąpił błąd podczas logowania"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-3">
          <LoginIcon fontSize="large" color="primary" />
        </div>
        <Typography variant="h4" component="h1" gutterBottom>
          Logowanie
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Zaloguj się do EduNotes
        </Typography>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <TextField
            sx={{ mb: 3 }}
            {...register("email")}
            label="Email"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isLoading}
            autoComplete="email"
          />

          <TextField
            sx={{ mb: 3 }}
            {...register("password")}
            label="Hasło"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isLoading}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            className="mt-6"
          >
            {isLoading ? (
              <Box className="flex items-center gap-2">
                <CircularProgress size={20} color="inherit" />
                Logowanie...
              </Box>
            ) : (
              "Zaloguj się"
            )}
          </Button>

          <div className="text-center mt-4">
            <Typography variant="body2" color="text.secondary">
              Nie masz konta?{" "}
              <Button
                variant="text"
                onClick={onSwitchToRegister}
                disabled={isLoading}
                className="p-0 text-primary"
              >
                Zarejestruj się
              </Button>
            </Typography>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
