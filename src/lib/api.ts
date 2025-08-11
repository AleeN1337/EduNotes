import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/backend",
  timeout: 10000,
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    console.log("API Request interceptor - URL:", config.url);
    console.log("API Request interceptor - Method:", config.method);
    console.log("API Request interceptor - BaseURL:", config.baseURL);
    console.log("API Request interceptor - Data:", config.data);
    console.log("API Request interceptor - Data type:", typeof config.data);

    // Add auth token only in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
        console.log("API Request - token attached");
      }
    }

    console.log("API Request interceptor - Final headers:", config.headers);
    return config;
  },
  (error) => {
    console.error("API Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Szczegółowe logowanie błędów 404
    if (error.response?.status === 404) {
      const url = error.config?.url;

      // Niektóre 404 są oczekiwane i nie powinny być logowane jako błędy
      const expected404Endpoints = [
        "/organization_users/me", // Użytkownik może nie być członkiem żadnej organizacji
        "/organization_users/", // Endpoint dla członków organizacji
        "/channels/channels_in_organization", // Organizacja może nie mieć kanałów
        "/topics/topics_in_channel", // Kanał może nie mieć tematów
        "/notes/notes_in_topic", // Temat może nie mieć notatek
        "/organizations/", // Organizacja może nie istnieć
        "/notes/my", // Użytkownik może nie mieć notatek
        "/deadlines/my_deadlines", // Użytkownik może nie mieć terminów
        "/auth/me", // Może nie być zaimplementowane w backend
        "/organization-invitations/sent", // Sent invites may not be implemented
        "/organization-invitations/my", // My invites endpoint may not exist
      ];

      if (expected404Endpoints.some((endpoint) => url?.includes(endpoint))) {
        console.log(
          `Expected 404 for ${url} - user has no data for this endpoint`
        );
      } else {
        console.error("Unexpected 404 Error Details:");
        console.error("- URL:", url);
        console.error("- Method:", error.config?.method);
        console.error("- Base URL:", error.config?.baseURL);
        console.error("- Full URL:", `${error.config?.baseURL}${url}`);
        console.error("- Response data:", error.response?.data);
      }
    } else {
      // Inne błędy loguj normalnie
      console.error("API Error:", {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,
      });
    }

    // Handle common errors here
    if (error.response?.status === 401) {
      // Handle unauthorized access - token wygasł lub nieprawidłowy
      console.error("Unauthorized access - token expired or invalid");

      // Usuń token i dane użytkownika z localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");

      // Przekieruj do strony logowania
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }

    // Handle network errors, timeouts, etc.
    if (!error.response) {
      console.error("Network error or timeout:", error.message);
      // Możemy przekształcić to na bardziej czytelny błąd
      error.isNetworkError = true;
    }

    return Promise.reject(error);
  }
);
export default api;
