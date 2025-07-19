import api from './api';
import { User, ApiResponse, LoginForm, RegisterForm } from "@/types";

export class AuthAPI {
  static async login(data: LoginForm): Promise<ApiResponse<User & { token: string }>> {
    try {
      // Używamy Next.js API route zamiast bezpośredniego wywołania backendu
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Błąd logowania");
      }
      
      // Zapisz token w localStorage
      if (result.token) {
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
      }
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Błąd logowania");
    }
  }

  static async register(data: RegisterForm): Promise<ApiResponse<User & { token: string }>> {
    try {
      // Używamy Next.js API route zamiast bezpośredniego wywołania backendu
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Błąd rejestracji");
      }
      
      // Zapisz token w localStorage
      if (result.token) {
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
      }
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || "Błąd rejestracji");
    }
  }

  static async logout(): Promise<void> {
    try {
      // Usuń dane z localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      
      // Opcjonalnie: wywołaj endpoint logout na backendzie
      // await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // Token prawdopodobnie wygasł
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        return null;
      }
      
      const result = await response.json();
      return result.user;
    } catch (error) {
      // Token prawdopodobnie wygasł
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
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
