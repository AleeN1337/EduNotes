import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log("Login attempt for email:", email);

    // Backend oczekuje form-urlencoded i używa email jako username
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    formData.append("grant_type", "password");

    console.log("Sending to backend:", `${process.env.BACKEND_URL}/auth/login`);

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    console.log("Backend response status:", backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.log("Backend error response:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText };
      }

      return NextResponse.json(
        {
          success: false,
          message: errorData.detail || "Nieprawidłowe dane logowania",
        },
        { status: 401 }
      );
    }

    const data = await backendResponse.json();
    console.log("Backend success response:", data);

    // Po udanym logowaniu, pobierz dane użytkownika z /users 
    let userData = null;
    if (data.access_token) {
      try {
        console.log("Fetching user data from /users endpoint...");
        const usersResponse = await fetch(`${process.env.BACKEND_URL}/users/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (usersResponse.ok) {
          const users = await usersResponse.json();
          console.log("Users data:", users);

    
          if (Array.isArray(users)) {
            const rawUserData =
              users.find((user) => user.email === email) || users[0]; 

            if (rawUserData) {
             
              userData = {
                id:
                  rawUserData.user_id?.toString() || rawUserData.id?.toString(),
                email: rawUserData.email,
                username: rawUserData.username,
                firstName: rawUserData.first_name || rawUserData.firstName,
                lastName: rawUserData.last_name || rawUserData.lastName,
                avatar: rawUserData.avatar_url || rawUserData.avatar,
                createdAt:
                  rawUserData.created_at || rawUserData.createdAt || new Date(),
                updatedAt:
                  rawUserData.updated_at || rawUserData.updatedAt || new Date(),
              };
            }
            console.log("Transformed user data:", userData);
          }
        }
      } catch (userFetchError) {
        console.warn("Failed to fetch user data:", userFetchError);
      }
    }

    return NextResponse.json({
      success: true,
      token: data.access_token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
