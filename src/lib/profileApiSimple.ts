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

      // Fallback - użyj danych z localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return {
          success: true,
          data: user,
          message: "User profile fetched successfully",
        };
      }

      throw new Error("Brak danych użytkownika");
    } catch (error: any) {
      console.error("ProfileAPI: Error fetching user profile:", error);
      throw new Error("Błąd podczas pobierania profilu użytkownika");
    }
  }

  // Pobierz organizacje użytkownika
  static async getUserOrganizations(): Promise<
    ApiResponse<UserOrganization[]>
  > {
    try {
      console.log("ProfileAPI: Fetching user organizations");

      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.warn(
          "ProfileAPI: No auth token, returning empty organizations"
        );
        return {
          success: true,
          data: [],
          message: "No auth token available",
        };
      }

      // Wywołaj prawdziwe API
      const response = await fetch("/api/backend/organization_users/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn(
          "ProfileAPI: Organizations API call failed:",
          response.status
        );
        return {
          success: true,
          data: [],
          message: "Organizations API not available",
        };
      }

      const data = await response.json();
      console.log("ProfileAPI: Organizations data received:", data);

      // Dla membership endpointu organization_users/me mapujemy wpisy na organizacje
      let orgs: UserOrganization[] = [];
      if (Array.isArray(data)) {
        // Pobierz pełne dane organizacji dla każdego membership
        const orgPromises = data.map(async (item: any) => {
          console.log("ProfileAPI: Mapping organization item:", item);

          const orgId = item.organization?.id || item.organization_id;
          let organizationName =
            item.organization?.organization_name || item.organization_name;

          // Jeśli nie mamy nazwy organizacji, pobierz ją z API
          if (!organizationName && orgId) {
            try {
              const orgResponse = await fetch(
                `/api/backend/organizations/${orgId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (orgResponse.ok) {
                const orgData = await orgResponse.json();
                organizationName = orgData.organization_name;
                console.log(
                  `ProfileAPI: Fetched organization name for ${orgId}:`,
                  organizationName
                );
              }
            } catch (error) {
              console.warn(
                `ProfileAPI: Could not fetch organization ${orgId} details:`,
                error
              );
            }
          }

          return {
            id: orgId,
            organization_name: organizationName || `Organizacja ${orgId}`,
            role: item.role,
            joined_at: item.joined_at,
          };
        });

        orgs = await Promise.all(orgPromises);
      } else if (Array.isArray(data.organizations)) {
        orgs = data.organizations.map((org: any) => {
          console.log("ProfileAPI: Mapping organization:", org);
          return {
            id: org.id,
            organization_name: org.organization_name || `Organizacja ${org.id}`,
            role: org.role,
            joined_at: org.joined_at,
          };
        });
      }
      console.log("ProfileAPI: Final mapped organizations:", orgs);
      return {
        success: true,
        data: orgs,
        message: "User organizations fetched successfully",
      };
    } catch (error: any) {
      console.error("ProfileAPI: Error fetching user organizations:", error);
      // Rzucaj błędem, aby komponent mógł go obsłużyć
      throw new Error("Błąd podczas pobierania organizacji");
    }
  }

  // Pobierz statystyki użytkownika
  static async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      console.log("ProfileAPI: Fetching user statistics");

      // Fallback - zwróć podstawowe statystyki
      const stats: UserStats = {
        totalNotes: 0,
        sharedNotes: 0,
        activeDays: 1,
        organizationCount: 0,
      };

      return {
        success: true,
        data: stats,
        message: "User statistics fetched successfully",
      };
    } catch (error: any) {
      console.error("ProfileAPI: Error fetching user statistics:", error);
      throw new Error("Błąd podczas pobierania statystyk");
    }
  }

  // Zmień hasło użytkownika - prostsze rozwiązanie
  static async changePassword(
    userId: string,
    passwordData: ChangePasswordData
  ): Promise<ApiResponse<void>> {
    try {
      console.log("ProfileAPI: Changing password for user:", userId);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Brak tokenu autoryzacji");
      }

      const requestBody = new URLSearchParams({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });

      console.log("ProfileAPI: Sending password change request");

      const response = await fetch(
        `/api/backend/users/${userId}/change_password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`,
          },
          body: requestBody,
        }
      );

      console.log("ProfileAPI: Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("ProfileAPI: Error response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        if (response.status === 422) {
          let errorMessage = "Nieprawidłowe dane";
          if (errorData?.detail) {
            if (Array.isArray(errorData.detail)) {
              const messages = errorData.detail
                .map((d: any) => d.msg || d.message || "Błąd walidacji")
                .join(", ");
              errorMessage = `Błąd walidacji: ${messages}`;
            } else {
              errorMessage = `Błąd: ${errorData.detail}`;
            }
          }
          throw new Error(errorMessage);
        } else if (response.status === 400) {
          throw new Error("Nieprawidłowe aktualne hasło");
        } else if (response.status === 401) {
          throw new Error("Brak autoryzacji - zaloguj się ponownie");
        } else {
          throw new Error(
            `Błąd serwera: ${response.status} - ${
              errorData?.message || "Nieznany błąd"
            }`
          );
        }
      }

      console.log("ProfileAPI: Password changed successfully");

      return {
        success: true,
        data: undefined,
        message: "Hasło zostało zmienione pomyślnie",
      };
    } catch (error: any) {
      console.error("ProfileAPI: Error changing password:", error);
      throw error;
    }
  }
}
