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

      return {
        success: true,
        data: response.data,
        message: "User profile fetched successfully",
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

      return {
        success: true,
        data: response.data || [],
        message: "User organizations fetched successfully",
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
          api.get("/notes/my").catch(() => ({ data: [] })),
          api.get("/ranking/my").catch(() => ({ data: { score: 0 } })),
          api.get("/organizations/my").catch(() => ({ data: [] })),
        ]);

      const totalNotes = Array.isArray(notesResponse.data)
        ? notesResponse.data.length
        : 0;
      const organizationCount = Array.isArray(organizationsResponse.data)
        ? organizationsResponse.data.length
        : 0;

      // Placeholder dla innych statystyk - będą rozwijane w przyszłości
      const sharedNotes = Math.floor(totalNotes * 0.6); // Tymczasowo 60% notatek jako udostępnione
      const activeDays = rankingResponse.data?.score
        ? Math.floor(rankingResponse.data.score / 10)
        : 42; // Tymczasowo na podstawie score

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
      console.log("ProfileAPI: Changing password for user:", userId);
      console.log("ProfileAPI: User ID type:", typeof userId);
      console.log("ProfileAPI: Password data:", {
        old_password_length: passwordData.old_password?.length || 0,
        new_password_length: passwordData.new_password?.length || 0,
        old_password_type: typeof passwordData.old_password,
        new_password_type: typeof passwordData.new_password,
        old_password_value: passwordData.old_password, // Tymczasowo dla debugowania
        new_password_value: passwordData.new_password, // Tymczasowo dla debugowania
      });

      // Różne warianty struktury danych dla backendu
      const bodyVariants = [
        // Wariant 1: DOKŁADNIE to czego oczekuje backend
        {
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        },
      ];

      // Użyj tylko pierwotnego formatu userId
      const userIdVariants = [
        userId, // oryginalny string
      ];

      console.log("ProfileAPI: Trying user ID variants:", userIdVariants);
      console.log("ProfileAPI: Trying body variants:", bodyVariants.length);

      let response;
      let lastError;

      // Próbuj różne kombinacje userID i struktury body
      for (const userIdVariant of userIdVariants) {
        for (const bodyVariant of bodyVariants) {
          try {
            console.log(
              `ProfileAPI: Trying user ID: ${userIdVariant} (${typeof userIdVariant}) with body:`,
              Object.keys(bodyVariant)
            );
            console.log("ProfileAPI: Full body data being sent:", bodyVariant);
            console.log(
              "ProfileAPI: JSON stringified body:",
              JSON.stringify(bodyVariant)
            );

            response = await api.put(
              `/users/${userIdVariant}/change_password`,
              bodyVariant
            );

            console.log(
              "ProfileAPI: SUCCESS with user ID:",
              userIdVariant,
              "and body:",
              Object.keys(bodyVariant)
            );
            break;
          } catch (error: any) {
            console.log(
              `ProfileAPI: Failed with user ID ${userIdVariant} and body ${Object.keys(
                bodyVariant
              )}:`,
              error.response?.status,
              error.response?.data
            );

            // Szczegółowe logowanie błędu 422
            if (
              error.response?.status === 422 &&
              error.response?.data?.detail
            ) {
              console.log(
                "ProfileAPI: 422 Error details:",
                JSON.stringify(error.response.data.detail, null, 2)
              );
              if (Array.isArray(error.response.data.detail)) {
                error.response.data.detail.forEach(
                  (detail: any, index: number) => {
                    console.log(
                      `ProfileAPI: Validation error ${index + 1}:`,
                      JSON.stringify(detail, null, 2)
                    );
                    if (detail.loc)
                      console.log(`  - Location: ${detail.loc.join(" -> ")}`);
                    if (detail.msg) console.log(`  - Message: ${detail.msg}`);
                    if (detail.type) console.log(`  - Type: ${detail.type}`);
                  }
                );
              }
            }

            lastError = error;
          }
        }

        if (response) break;
      }

      if (!response) {
        console.error(
          "ProfileAPI: All attempts failed. Last error:",
          lastError
        );
        throw (
          lastError ||
          new Error("Wszystkie próby zmiany hasła nie powiodły się")
        );
      }

      console.log("ProfileAPI: Password change response:", response);
      console.log("ProfileAPI: Response status:", response.status);
      console.log("ProfileAPI: Response data:", response.data);

      return {
        success: true,
        data: undefined,
        message: response.data?.message || "Hasło zostało pomyślnie zmienione",
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

      const response = await api.put(`/users/${userId}/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        success: true,
        data: response.data,
        message: "Avatar został pomyślnie zaktualizowany",
      };
    } catch (error: any) {
      console.error("ProfileAPI: Error uploading avatar:", error);
      throw new Error(
        error.response?.data?.message || "Błąd podczas uploadu avatara"
      );
    }
  }
}
