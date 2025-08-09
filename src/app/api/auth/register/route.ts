import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse request body (supports JSON and URL-encoded form)
    let firstName: string, lastName: string, email: string, username: string, password: string;
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      firstName = params.get("first_name") || "";
      lastName = params.get("last_name") || "";
      email = params.get("email") || "";
      username = params.get("username") || "";
      password = params.get("password") || "";
    } else {
      const body = await request.json();
      firstName = body.firstName;
      lastName = body.lastName;
      email = body.email;
      username = body.username;
      password = body.password;
    }

    // Validation and debugging
    console.log("Registration request data:", {
      firstName,
      lastName,
      email,
      username,
      password: password ? `[${password.length} chars]` : 'missing'
    });

    // Use internal proxy endpoint for backend calls
    const origin = request.nextUrl.origin;
    const registerUrl = process.env.BACKEND_URL
      ? `${process.env.BACKEND_URL}/auth/register`
      : `${origin}/api/backend/auth/register`;
    
    // Backend expects JSON for registration (unlike login which expects form-urlencoded)
    const registerData = {
      username: username,
      email: email,
      password: password,
      first_name: firstName,
      last_name: lastName,
    };
    
    console.log("Sending to backend:", {
      url: registerUrl,
      data: { ...registerData, password: registerData.password ? `[${registerData.password.length} chars]` : 'missing' }
    });
    
    const backendResponse = await fetch(registerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error("Backend registration error:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData
      });
      return NextResponse.json(
        {
          success: false,
          message: errorData.detail || errorData.message || "Błąd podczas rejestracji",
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log("Backend registration success:", data);

    return NextResponse.json({
      success: true,
      token: data.access_token || data.token,
      user: data.user || data.data?.user || data,
      message: "Rejestracja przebiegła pomyślnie",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
