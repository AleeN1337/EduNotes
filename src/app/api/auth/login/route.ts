import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!backendResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowe dane logowania" },
        { status: 401 }
      );
    }

    const data = await backendResponse.json();

    return NextResponse.json({
      success: true,
      token: data.token,
      user: data.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
