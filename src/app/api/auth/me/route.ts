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
    const origin = request.nextUrl.origin;
    const backendBase = process.env.BACKEND_URL || `${origin}/api/backend`;

    // Użyj /organization_users/me zamiast nieistniejącego /auth/me
    const backendResponse = await fetch(
      `${backendBase}/organization_users/me`,
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
        const userResponse = await fetch(`${backendBase}/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (userResponse.ok) {
          const userInfo = await userResponse.json();
          const raw = userInfo.data;
          const normalizedUser = {
            id: (raw?.user_id ?? raw?.id ?? "temp").toString(),
            email: raw?.email ?? "",
            username:
              raw?.username ??
              (raw?.email ? String(raw.email).split("@")[0] : "user"),
            firstName: raw?.first_name ?? raw?.firstName ?? "",
            lastName: raw?.last_name ?? raw?.lastName ?? "",
            avatar: raw?.avatar_url ?? raw?.avatar ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return NextResponse.json({
            success: true,
            user: normalizedUser,
          });
        } else {
          // Fallback: return minimal user with id from org mapping
          return NextResponse.json({
            success: true,
            user: {
              id: String(userId),
              email: "",
              username: "user",
              firstName: "",
              lastName: "",
              avatar: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }
      } catch (userError) {
        console.warn("Nie udało się pobrać danych użytkownika:", userError);
        // Fallback: minimal user with id from org mapping
        return NextResponse.json({
          success: true,
          user: {
            id: String(userId),
            email: "",
            username: "user",
            firstName: "",
            lastName: "",
            avatar: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    }

    // Jeśli brak organizacji, spróbuj ustalić użytkownika po adresie email z tokena
    try {
      const [, payloadB64] = token.split(".");
      const payloadStr = Buffer.from(payloadB64, "base64").toString("utf8");
      const payload = JSON.parse(payloadStr);
      const email = payload?.sub || payload?.email;
      if (typeof email === "string") {
        const usersResp = await fetch(`${backendBase}/users/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (usersResp.ok) {
          const usersJson = await usersResp.json();
          const arr = Array.isArray(usersJson?.data) ? usersJson.data : [];
          const found = arr.find((u: any) => u.email === email);
          if (found) {
            const normalizedUser = {
              id: (found.user_id ?? found.id ?? "temp").toString(),
              email: found.email ?? "",
              username:
                found.username ??
                (found.email ? String(found.email).split("@")[0] : "user"),
              firstName: found.first_name ?? found.firstName ?? "",
              lastName: found.last_name ?? found.lastName ?? "",
              avatar: found.avatar_url ?? found.avatar ?? null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            return NextResponse.json({ success: true, user: normalizedUser });
          }
        }
      }
    } catch (fallbackErr) {
      console.warn("/auth/me fallback user resolution failed", fallbackErr);
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
