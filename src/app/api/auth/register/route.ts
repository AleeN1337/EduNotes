import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse request body (supports JSON and URL-encoded form) with guards
    let firstName = "";
    let lastName = "";
    let email = "";
    let username = "";
    let password = "";
    const contentType = (
      request.headers.get("content-type") || ""
    ).toLowerCase();
    try {
      if (contentType.includes("application/x-www-form-urlencoded")) {
        const text = await request.text();
        const params = new URLSearchParams(text);
        firstName = params.get("first_name") || params.get("firstName") || "";
        lastName = params.get("last_name") || params.get("lastName") || "";
        email = params.get("email") || "";
        username = params.get("username") || "";
        password = params.get("password") || "";
      } else {
        const body = await request.json().catch(() => null);
        if (body && typeof body === "object") {
          firstName = body.firstName || body.first_name || "";
          lastName = body.lastName || body.last_name || "";
          email = body.email || "";
          username = body.username || "";
          password = body.password || "";
        }
      }
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowe dane żądania" },
        { status: 422 }
      );
    }

    // Sanitize inputs: trim and normalize casing
    firstName = (firstName || "").trim();
    lastName = (lastName || "").trim();
    email = (email || "").trim().toLowerCase();
    username = (username || "").trim().toLowerCase();
    password = password || "";

    // Quick guard: missing fields
    if (!email || !username || !firstName || !lastName || !password) {
      return NextResponse.json(
        { success: false, message: "Wszystkie pola są wymagane" },
        { status: 422 }
      );
    }

    console.log("Registration request data (sanitized):", {
      firstName,
      lastName,
      email,
      username,
      password: password ? `[${password.length} chars]` : "missing",
    });

    // Use internal proxy endpoint for backend calls if BACKEND_URL not set
    const origin = request.nextUrl.origin;
    const backendBase = process.env.BACKEND_URL || `${origin}/api/backend`;

    const registerUrl = `${backendBase}/auth/register`;

    // Backend expects JSON for registration
    const registerData = {
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    };

    console.log("Sending to backend:", {
      url: registerUrl,
      data: { ...registerData, password: `[${password.length} chars]` },
    });

    // Send JSON (backend for /auth/register expects JSON per API contract)
    let backendResponse = await fetch(registerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(registerData),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text().catch(() => "");
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {}
      console.error("Backend registration error:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        errorData,
      });
      const detailMsg = Array.isArray(errorData?.detail)
        ? errorData.detail
            ?.map((d: any) => d?.msg)
            .filter(Boolean)
            .join("; ")
        : typeof errorData?.detail === "string"
        ? errorData.detail
        : undefined;

      // If the error looks like duplicate email/username, try to log the user in and treat it as success
      const looksLikeDuplicate =
        /already\s+exists|exists|istnieje|zaj(et|ę)ty|taken|duplicate|unique/i.test(
          `${detailMsg || ""} ${errorText || ""}`
        );
      if (backendResponse.status === 422 && looksLikeDuplicate) {
        try {
          const loginUrl = `${backendBase}/auth/login`;
          const loginBody = new URLSearchParams();
          loginBody.append("username", email);
          loginBody.append("password", password);
          loginBody.append("grant_type", "password");
          const loginResp = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
            body: loginBody.toString(),
          });
          if (loginResp.ok) {
            const loginData = await loginResp.json();
            const token = loginData.access_token || loginData.token;
            // Build minimal user from provided data (normalized)
            const normalizedUser = {
              id: "temp",
              email,
              username,
              firstName,
              lastName,
              avatar: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            return NextResponse.json({
              success: true,
              token,
              user: normalizedUser,
              message:
                "Konto już istniało — zalogowano automatycznie po rejestracji",
            });
          }
        } catch (e) {
          console.warn("Auto-login on duplicate failed:", e);
        }
      }

      const message =
        detailMsg || errorData?.message || "Błąd podczas rejestracji (422)";

      // If backend returns 5xx but user might actually be created, try to log in pragmatically
      if (backendResponse.status >= 500 && email && password) {
        try {
          const loginUrl = `${backendBase}/auth/login`;
          const loginBody = new URLSearchParams();
          loginBody.append("username", email);
          loginBody.append("password", password);
          loginBody.append("grant_type", "password");
          const loginResp = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
            body: loginBody.toString(),
          });
          if (loginResp.ok) {
            const loginData = await loginResp.json();
            const token = loginData.access_token || loginData.token;
            const normalizedUser = {
              id: "temp",
              email,
              username,
              firstName,
              lastName,
              avatar: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            return NextResponse.json({
              success: true,
              token,
              user: normalizedUser,
              message:
                "Rejestracja prawdopodobnie się powiodła — zalogowano automatycznie",
            });
          }
        } catch (e) {
          console.warn("Auto-login after 5xx register failed:", e);
        }
      }

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: backendResponse.status }
      );
    }

    const successText = await backendResponse.text().catch(() => "");
    console.log(
      "Backend registration success (raw):",
      successText || "<empty>"
    );

    // Wrap normalization and auto-login to avoid throwing after successful register
    try {
      let data: any = null;
      try {
        data = successText ? JSON.parse(successText) : null;
      } catch {
        // non-JSON body is fine
      }

      const raw = data?.data?.user || data?.user || data?.data || data || null;
      const normalizedUser = {
        id: (raw?.user_id ?? raw?.id ?? "temp").toString(),
        email: raw?.email ?? email,
        username:
          raw?.username ??
          (raw?.email ? String(raw.email).split("@")[0] : username),
        firstName: raw?.first_name ?? raw?.firstName ?? firstName,
        lastName: raw?.last_name ?? raw?.lastName ?? lastName,
        avatar: raw?.avatar_url ?? raw?.avatar ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Attempt auto-login to obtain token after successful registration
      let token: string | undefined = undefined;
      try {
        const loginUrl = `${backendBase}/auth/login`;
        const loginBody = new URLSearchParams();
        loginBody.append("username", email);
        loginBody.append("password", password);
        loginBody.append("grant_type", "password");
        const loginResp = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: loginBody.toString(),
        });
        if (loginResp.ok) {
          const loginData = await loginResp.json();
          token = loginData.access_token || loginData.token;
        } else {
          console.warn(
            "Auto-login after register failed with status:",
            loginResp.status
          );
        }
      } catch (e) {
        console.warn("Auto-login after register threw:", e);
      }

      return NextResponse.json({
        success: true,
        token,
        user: normalizedUser,
        message: "Rejestracja przebiegła pomyślnie",
      });
    } catch {
      // Even if normalization/login fails, confirm registration success
      return NextResponse.json({
        success: true,
        token: undefined,
        user: {
          id: "temp",
          email,
          username,
          firstName,
          lastName,
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        message: "Rejestracja przebiegła pomyślnie (bez auto-logowania)",
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
