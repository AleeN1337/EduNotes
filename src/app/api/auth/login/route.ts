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

    const origin = request.nextUrl.origin;
    const backendBase = process.env.BACKEND_URL || `${origin}/api/backend`;
    const loginUrl = `${backendBase}/auth/login`;
    console.log("Sending to backend:", loginUrl);

    const backendResponse = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData,
    });

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

    // Przygotuj minimalne dane użytkownika; będą nadpisane jeśli znajdziemy dokładniejsze
    let userData: any = {
      id: "temp",
      email,
      username: email.split("@")[0],
      firstName: "",
      lastName: "",
      avatar: null,
      score: 0,
      rank: "niekompetentny",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Po udanym logowaniu, spróbuj wzbogacić dane użytkownika
    if (data.access_token) {
      try {
        console.log(
          "Fetching user organizations from /organization_users/me..."
        );
        const origin = request.nextUrl.origin;
        const backendBase = process.env.BACKEND_URL || `${origin}/api/backend`;
        const orgUsersResponse = await fetch(
          `${backendBase}/organization_users/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (orgUsersResponse.ok) {
          const orgUsers = await orgUsersResponse.json();
          console.log("Organization users data:", orgUsers);
          if (orgUsers.success && orgUsers.data && orgUsers.data.length > 0) {
            // If user has organizations, fetch full user data
            const userId = orgUsers.data[0].user_id;
            try {
              const userResponse = await fetch(
                `${backendBase}/users/${userId}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${data.access_token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              if (userResponse.ok) {
                const userInfo = await userResponse.json();
                const raw = userInfo.data;
                userData = {
                  id: raw.user_id?.toString(),
                  email: raw.email,
                  username: raw.username,
                  firstName: raw.first_name,
                  lastName: raw.last_name,
                  avatar: raw.avatar_url,
                  score: raw.score,
                  rank: raw.rank,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                console.log("Transformed user data:", userData);
              }
            } catch {}
          } else {
            // Brak organizacji — spróbuj pobrać użytkownika z listy /users/ po email
            try {
              const usersResp = await fetch(`${backendBase}/users/`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${data.access_token}`,
                  "Content-Type": "application/json",
                },
              });
              if (usersResp.ok) {
                const usersList = await usersResp.json();
                const arr = Array.isArray(usersList?.data)
                  ? usersList.data
                  : [];
                const found = arr.find((u: any) => u.email === email);
                if (found) {
                  userData = {
                    id: found.user_id?.toString(),
                    email: found.email,
                    username: found.username,
                    firstName: found.first_name,
                    lastName: found.last_name,
                    avatar: found.avatar_url,
                    score: found.score,
                    rank: found.rank,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                }
              }
            } catch (e) {
              console.warn("Failed to fetch users list for email lookup", e);
            }
            if (!userData || !userData.id || userData.id === "temp") {
              // Ostatnia próba: odczytaj email z tokena (JWT) i ustaw username
              try {
                const [, payloadB64] = data.access_token.split(".");
                const json = JSON.parse(
                  Buffer.from(payloadB64, "base64").toString("utf8")
                );
                const tokenEmail = json?.sub || json?.email;
                if (
                  typeof tokenEmail === "string" &&
                  tokenEmail.includes("@")
                ) {
                  userData = {
                    ...userData,
                    email: tokenEmail,
                    username: tokenEmail.split("@")[0],
                  };
                }
              } catch {}
            }
          }
        } else {
          // Treat non-OK as no organizations
          // userData już zawiera minimalny zestaw
        }
      } catch (orgFetchError) {
        console.warn("Failed to fetch organization data:", orgFetchError);
        // userData pozostaje minimalne
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
