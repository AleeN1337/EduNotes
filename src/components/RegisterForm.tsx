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
import { PersonAdd as RegisterIcon } from "@mui/icons-material";
import { registerSchema, RegisterFormData } from "@/lib/validationSchemas";
import { AuthAPI } from "@/lib/authApiWithFallback";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const [error, setError] = useState<string>("");
  const [hint, setHint] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError("");
      setHint("");

      // Konwersja danych formularza na format API
      const registerData = {
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      };

      // Wywołanie API
      const result = await AuthAPI.register(registerData);
      if (result?.success) {
        onSuccess?.();
      } else {
        setError(result?.message || "Wystąpił błąd podczas rejestracji");
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Wystąpił błąd podczas rejestracji";
      setError(msg);
      // Podpowiedź dla 422/dublikatów
      if (/422|istnieje|zaj(et|ę)ty|exists|duplicate|unique/i.test(msg)) {
        setHint(
          "Wygląda na to, że konto już istnieje lub dane są nieprawidłowe. Jeśli konto istnieje — przejdź do logowania."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <RegisterIcon fontSize="large" color="primary" />
        </div>
        <Typography variant="h4" component="h1" gutterBottom>
          Rejestracja
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Utwórz nowe konto w EduNotes
        </Typography>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Box className="mb-4 space-y-2">
              <Alert severity="error">{error}</Alert>
              {hint && (
                <Alert severity="info">
                  {hint}
                  {onSwitchToLogin && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={onSwitchToLogin}
                      disabled={isLoading}
                      sx={{ ml: 1 }}
                    >
                      Przejdź do logowania
                    </Button>
                  )}
                </Alert>
              )}
            </Box>
          )}

          <TextField
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
            {...register("username")}
            label="Username"
            fullWidth
            error={!!errors.username}
            helperText={errors.username?.message}
            disabled={isLoading}
            autoComplete="username"
          />

          <div className="grid grid-cols-2 gap-4">
            <TextField
              {...register("firstName")}
              label="Imię"
              fullWidth
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              disabled={isLoading}
              autoComplete="given-name"
            />
            <TextField
              {...register("lastName")}
              label="Nazwisko"
              fullWidth
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              disabled={isLoading}
              autoComplete="family-name"
            />
          </div>

          <TextField
            sx={{ mb: 2 }}
            {...register("password")}
            label="Hasło"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isLoading}
            autoComplete="new-password"
          />

          <TextField
            sx={{ mb: 2 }}
            {...register("confirmPassword")}
            label="Potwierdź hasło"
            type="password"
            fullWidth
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            disabled={isLoading}
            autoComplete="new-password"
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
                Rejestrowanie...
              </Box>
            ) : (
              "Zarejestruj się"
            )}
          </Button>

          <div className="text-center mt-4">
            <Typography variant="body2" color="text.secondary">
              Masz już konto?{" "}
              <Button
                variant="text"
                onClick={onSwitchToLogin}
                disabled={isLoading}
                className="p-0 text-primary"
              >
                Zaloguj się
              </Button>
            </Typography>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
