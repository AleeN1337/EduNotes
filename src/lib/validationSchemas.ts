import { z } from "zod";

// Schema dla logowania
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Nieprawidłowy format email"),
  password: z
    .string()
    .min(1, "Hasło jest wymagane")
    .min(6, "Hasło musi mieć minimum 6 znaków"),
});

// Schema dla rejestracji
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email jest wymagany")
      .email("Nieprawidłowy format email"),
    username: z
      .string()
      .min(1, "Username jest wymagany")
      .min(3, "Username musi mieć minimum 3 znaki")
      .max(20, "Username może mieć maksimum 20 znaków")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username może zawierać tylko litery, cyfry i _"
      ),
    firstName: z
      .string()
      .min(1, "Imię jest wymagane")
      .min(2, "Imię musi mieć minimum 2 znaki"),
    lastName: z
      .string()
      .min(1, "Nazwisko jest wymagane")
      .min(2, "Nazwisko musi mieć minimum 2 znaki"),
    password: z
      .string()
      .min(1, "Hasło jest wymagane")
      .min(8, "Hasło musi mieć minimum 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać przynajmniej jedną wielką literę")
      .regex(/[a-z]/, "Hasło musi zawierać przynajmniej jedną małą literę")
      .regex(/[0-9]/, "Hasło musi zawierać przynajmniej jedną cyfrę"),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła się nie zgadzają",
    path: ["confirmPassword"],
  });

// Typy inferred z schema
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
