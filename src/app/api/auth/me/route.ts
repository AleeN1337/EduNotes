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

    const backendResponse = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowy token" },
        { status: 401 }
      );
    }

    const userData = await backendResponse.json();

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
