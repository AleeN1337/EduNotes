import api from "./api";
import { User, ApiResponse, LoginForm, RegisterForm } from "@/types";

// Tymczasowy mock dla logowania (do celów deweloperskich)
const MOCK_TOKEN = "mock-jwt-token-12345";
const MOCK_USERS: Record<string, User> = {
  "test@example.com": {
    id: "3",
    email: "test@example.com",
    username: "testuser",
    firstName: "Jan",
    lastName: "Kowalski",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "test2@example.com": {
    id: "5",
    email: "test2@example.com",
    username: "testuser2",
    firstName: "Anna",
    lastName: "Nowak",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export class AuthAPI {
  static async login(
    data: LoginForm
  ): Promise<ApiResponse<User & { token: string }>> {
    try {
      // Najpierw spróbuj prawdziwego API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Prawdziwe logowanie zadziałało
        if (result.token) {
          localStorage.setItem("auth_token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));
        }
        return result;
      } else {
        // Fallback do mock logowania dla developmentu
        console.warn("Backend login failed, using mock login for development");

        const mockUser = MOCK_USERS[data.email];
        if (mockUser) {
          localStorage.setItem("auth_token", MOCK_TOKEN);
          localStorage.setItem("user", JSON.stringify(mockUser));

          return {
            success: true,
            data: { ...mockUser, token: MOCK_TOKEN },
            message: "Mock login successful",
          };
        } else {
          throw new Error("Nie znaleziono użytkownika (mock)");
        }
      }
    } catch (error: any) {
      // Jeśli wszystko zawodzi, spróbuj mock logowania
      console.warn("API call failed, trying mock login:", error.message);

      const mockUser = MOCK_USERS[data.email];
      if (mockUser) {
        localStorage.setItem("auth_token", MOCK_TOKEN);
        localStorage.setItem("user", JSON.stringify(mockUser));

        return {
          success: true,
          data: { ...mockUser, token: MOCK_TOKEN },
          message: "Mock login successful",
        };
      }

      throw new Error("Błąd logowania");
    }
  }

  static async register(
    data: RegisterForm
  ): Promise<ApiResponse<User & { token: string }>> {
    try {
      // Użyj prawdziwego API dla rejestracji (działa!)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Błąd rejestracji");
      }

      // Po rejestracji automatycznie zaloguj (mock token)
      const newUser: User = {
        id: result.user?.user_id?.toString() || "999",
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorage.setItem("auth_token", MOCK_TOKEN);
      localStorage.setItem("user", JSON.stringify(newUser));

      return {
        success: true,
        data: { ...newUser, token: MOCK_TOKEN },
        message: "Rejestracja przebiegła pomyślnie",
      };
    } catch (error: any) {
      throw new Error(error.message || "Błąd rejestracji");
    }
  }

  static async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;

      // Zawsze najpierw spróbuj localStorage (dla wszystkich tokenów)
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          return JSON.parse(userJson);
        } catch (parseError) {
          console.warn("Failed to parse user from localStorage:", parseError);
        }
      }

      // Jeśli to mock token, nie próbuj API
      if (token === MOCK_TOKEN) {
        return null;
      }

      // Tylko dla prawdziwych tokenów spróbuj pobrać dane użytkownika
      // Problem: API nie ma /auth/me, więc używamy stored user data
      const storedUser = this.getStoredUser();
      if (storedUser && storedUser.id) {
        try {
          // Próbujemy pobrać aktualne dane z API
          console.log(
            `AuthAPI: Trying to fetch user data for ID: ${storedUser.id}`
          );
          const response = await api.get(`/users/${storedUser.id}`);
          console.log(
            "AuthAPI: Successfully fetched user data from API:",
            response.data
          );
          return response.data;
        } catch (apiError: any) {
          console.warn(
            `AuthAPI: API /users/${storedUser.id} failed:`,
            apiError
          );
          if (apiError.response?.status === 404) {
            console.log(
              "AuthAPI: User not found in API (404), using stored user data"
            );
          }
          // Fallback - zwracamy stored user
          return storedUser;
        }
      }

      return null;
    } catch (error) {
      console.warn("getCurrentUser failed:", error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  }

  static getStoredUser(): User | null {
    try {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  }
}
