import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Pobierz token z nagłówka Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Token autoryzacji jest wymagany" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Użyj /organization_users/me zamiast nieistniejącego /auth/me
    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/organization_users/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowy token" },
        { status: 401 }
      );
    }

    const userData = await backendResponse.json();

    // Jeśli użytkownik ma organizacje, pobierz podstawowe dane użytkownika
    if (userData.success && userData.data && userData.data.length > 0) {
      const userId = userData.data[0].user_id;

      try {
        const userResponse = await fetch(
          `${process.env.BACKEND_URL}/users/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (userResponse.ok) {
          const userInfo = await userResponse.json();
          return NextResponse.json({
            success: true,
            user: userInfo.data,
          });
        }
      } catch (userError) {
        console.warn("Nie udało się pobrać danych użytkownika:", userError);
      }
    }

    return NextResponse.json({
      success: true,
      user: null,
      organizations: userData.data,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
