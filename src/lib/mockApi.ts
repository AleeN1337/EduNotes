import { User, ApiResponse, LoginForm, RegisterForm } from "@/types";

// Mock data storage
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "test@student.pl",
    username: "test123",
    firstName: "Jan",
    lastName: "Testowy",
    avatar: undefined,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
];

// Mock passwords (w prawdziwej aplikacji będą zahashowane)
const MOCK_PASSWORDS: Record<string, string> = {
  "test@student.pl": "test123",
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockAuthAPI {
  static async login(
    data: LoginForm
  ): Promise<ApiResponse<User & { token: string }>> {
    await delay(1000); // Symulacja opóźnienia sieciowego

    const { email, password } = data;

    // Sprawdź czy użytkownik istnieje
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user) {
      throw new Error("Błędny email lub hasło");
    }

    // Sprawdź hasło
    if (MOCK_PASSWORDS[email] !== password) {
      throw new Error("Błędny email lub hasło");
    }

    // Generuj mock token
    const token = `mock-jwt-${user.id}-${Date.now()}`;

    // Zapisz token w localStorage
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return {
      success: true,
      data: {
        ...user,
        token,
      },
      message: "Zalogowano pomyślnie",
    };
  }

  static async register(
    data: RegisterForm
  ): Promise<ApiResponse<User & { token: string }>> {
    await delay(1500); // Symulacja opóźnienia

    const { email, username, firstName, lastName, password, confirmPassword } =
      data;

    // Walidacja hasła
    if (password !== confirmPassword) {
      throw new Error("Hasła się nie zgadzają");
    }

    // Sprawdź czy email jest zajęty
    if (MOCK_USERS.some((u) => u.email === email)) {
      throw new Error("Email jest już zajęty");
    }

    // Sprawdź czy username jest zajęty
    if (MOCK_USERS.some((u) => u.username === username)) {
      throw new Error("Username jest już zajęty");
    }

    // Utwórz nowego użytkownika
    const newUser: User = {
      id: (MOCK_USERS.length + 1).toString(),
      email,
      username,
      firstName,
      lastName,
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Dodaj do mock storage
    MOCK_USERS.push(newUser);
    MOCK_PASSWORDS[email] = password;

    // Generuj token
    const token = `mock-jwt-${newUser.id}-${Date.now()}`;

    // Zapisz w localStorage
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(newUser));

    return {
      success: true,
      data: {
        ...newUser,
        token,
      },
      message: "Użytkownik został zarejestrowany",
    };
  }

  static async logout(): Promise<ApiResponse<null>> {
    await delay(500);

    // Usuń z localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");

    return {
      success: true,
      data: null,
      message: "Wylogowano pomyślnie",
    };
  }

  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  static getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
