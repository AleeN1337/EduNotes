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

    // Po udanym logowaniu, pobierz dane użytkownika z /organization_users/me
    let userData = null;
    if (data.access_token) {
      try {
        console.log(
          "Fetching user organizations from /organization_users/me..."
        );
        const orgUsersResponse = await fetch(
          `${process.env.BACKEND_URL}/organization_users/me`,
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

          // Jeśli użytkownik ma organizacje, pobierz dane użytkownika
          if (orgUsers.success && orgUsers.data && orgUsers.data.length > 0) {
            const userId = orgUsers.data[0].user_id;

            try {
              const userResponse = await fetch(
                `${process.env.BACKEND_URL}/users/${userId}`,
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
                const rawUserData = userInfo.data;

                userData = {
                  id: rawUserData.user_id?.toString(),
                  email: rawUserData.email,
                  username: rawUserData.username,
                  firstName: rawUserData.first_name,
                  lastName: rawUserData.last_name,
                  avatar: rawUserData.avatar_url,
                  score: rawUserData.score,
                  rank: rawUserData.rank,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                console.log("Transformed user data:", userData);
              }
            } catch (userFetchError) {
              console.warn(
                "Failed to fetch specific user data:",
                userFetchError
              );
            }
          } else {
            // Użytkownik nie ma organizacji, stwórz podstawowe dane z email
            userData = {
              id: "temp", // Będzie zaktualizowane gdy użytkownik dołączy do organizacji
              email: email,
              username: email.split("@")[0],
              firstName: "",
              lastName: "",
              avatar: null,
              score: 0,
              rank: "niekompetentny",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }
        }
      } catch (orgFetchError) {
        console.warn("Failed to fetch organization data:", orgFetchError);
        // Fallback - stwórz podstawowe dane użytkownika
        userData = {
          id: "temp",
          email: email,
          username: email.split("@")[0],
          firstName: "",
          lastName: "",
          avatar: null,
          score: 0,
          rank: "niekompetentny",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
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
