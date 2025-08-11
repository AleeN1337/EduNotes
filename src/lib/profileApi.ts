import api from "./api";
import { User, ApiResponse } from "@/types";

export interface UserStats {
  totalNotes: number;
  sharedNotes: number;
  activeDays: number;
  organizationCount: number;
}

export interface UserOrganization {
  id: string;
  organization_name: string;
  role: string;
  joined_at: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export class ProfileAPI {
  // Pobierz pełne dane użytkownika
  static async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    try {
      console.log("ProfileAPI: Fetching user profile for ID:", userId);
      const response = await api.get(`/users/${userId}`);
      const envelope = response.data;
      const data: User = envelope?.data ?? envelope; // unwrap {data}
      return {
        success: true,
        data,
        message: envelope?.message || "User profile fetched successfully",
      };
    } catch (error: any) {
      console.error("ProfileAPI: Error fetching user profile:", error);
      throw new Error(
        error.response?.data?.message ||
          "Błąd podczas pobierania profilu użytkownika"
      );
    }
  }

  // Pobierz organizacje użytkownika
  static async getUserOrganizations(): Promise<
    ApiResponse<UserOrganization[]>
  > {
    try {
      console.log("ProfileAPI: Fetching user organizations");
      const response = await api.get("/organizations/my");
      const envelope = response.data;
      const data: UserOrganization[] = envelope?.data ?? [];
      return {
        success: true,
        data,
        message: envelope?.message || "User organizations fetched successfully",
      };
    } catch (error: any) {
      console.error("ProfileAPI: Error fetching user organizations:", error);
      throw new Error(
        error.response?.data?.message || "Błąd podczas pobierania organizacji"
      );
    }
  }

  // Pobierz statystyki użytkownika
  static async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      console.log("ProfileAPI: Fetching user statistics");

      // Równoległe wywołania API
      const [notesResponse, rankingResponse, organizationsResponse] =
        await Promise.all([
          api.get("/notes/my").catch(() => ({ data: { data: [] } })),
          api
            .get("/ranking/my")
            .catch(() => ({ data: { data: { score: 0 } } })),
          api.get("/organizations/my").catch(() => ({ data: { data: [] } })),
        ]);

      const notes = notesResponse.data?.data ?? [];
      const orgs = organizationsResponse.data?.data ?? [];
      const score = rankingResponse.data?.data?.score ?? 0;

      const totalNotes = Array.isArray(notes) ? notes.length : 0;
      const organizationCount = Array.isArray(orgs) ? orgs.length : 0;

      // Placeholder dla innych statystyk - będą rozwijane w przyszłości
      const sharedNotes = Math.floor(totalNotes * 0.6);
      const activeDays = Math.floor(score / 10);

      const stats: UserStats = {
        totalNotes,
        sharedNotes,
        activeDays,
        organizationCount,
      };

      return {
        success: true,
        data: stats,
        message: "User statistics fetched successfully",
      };
    } catch (error: any) {
      console.error("ProfileAPI: Error fetching user statistics:", error);
      throw new Error(
        error.response?.data?.message || "Błąd podczas pobierania statystyk"
      );
    }
  }

  // Zmień hasło użytkownika
  static async changePassword(
    userId: string,
    passwordData: ChangePasswordData
  ): Promise<ApiResponse<void>> {
    try {
      // Backend wymaga application/x-www-form-urlencoded
      const form = new URLSearchParams();
      form.append("old_password", passwordData.old_password);
      form.append("new_password", passwordData.new_password);

      const response = await api.put(`/users/${userId}/change_password`, form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const envelope = response.data;
      return {
        success: true,
        data: undefined,
        message: envelope?.message || "Hasło zostało pomyślnie zmienione",
      };
    } catch (error: any) {
      console.error("ProfileAPI: Error changing password:", error);
      console.error("ProfileAPI: Error response:", error.response);
      console.error("ProfileAPI: Error status:", error.response?.status);
      console.error("ProfileAPI: Error data:", error.response?.data);

      let errorMessage = "Błąd podczas zmiany hasła";

      if (error.response?.status === 400) {
        errorMessage =
          "Nieprawidłowe dane. Sprawdź czy aktualne hasło jest poprawne.";
      } else if (error.response?.status === 401) {
        errorMessage = "Brak autoryzacji. Zaloguj się ponownie.";
      } else if (error.response?.status === 404) {
        errorMessage = "Użytkownik nie został znaleziony.";
      } else if (error.response?.status === 422) {
        // Dodaj więcej szczegółów dla błędu 422
        if (error.response?.data?.detail) {
          if (Array.isArray(error.response.data.detail)) {
            const details = error.response.data.detail
              .map((d: any) => d.msg || d.message || JSON.stringify(d))
              .join(", ");
            errorMessage = `Nieprawidłowy format danych: ${details}`;
          } else {
            errorMessage = `Nieprawidłowy format danych: ${error.response.data.detail}`;
          }
        } else if (error.response?.data?.message) {
          errorMessage = `Nieprawidłowy format danych: ${error.response.data.message}`;
        } else {
          errorMessage =
            "Nieprawidłowy format danych. Sprawdź logi konsoli dla szczegółów.";
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // Upload avatara użytkownika
  static async uploadAvatar(
    userId: string,
    file: File
  ): Promise<ApiResponse<{ avatar_url: string }>> {
    try {
      console.log("ProfileAPI: Uploading avatar for user:", userId);

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.put(`/users/${userId}/avatar`, formData);

      const envelope = response.data;
      return {
        success: true,
        data: envelope?.data ?? envelope,
        message: envelope?.message || "Avatar został pomyślnie zaktualizowany",
      };
    } catch (error: any) {
      console.error("ProfileAPI: Error uploading avatar:", error);
      throw new Error(
        error.response?.data?.message || "Błąd podczas uploadu avatara"
      );
    }
  }
}
