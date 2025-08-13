import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleBackendRequest(request, "GET", resolvedParams.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleBackendRequest(request, "POST", resolvedParams.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleBackendRequest(request, "PUT", resolvedParams.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleBackendRequest(request, "DELETE", resolvedParams.path);
}

async function handleBackendRequest(
  request: NextRequest,
  method: string,
  pathParts: string[]
) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    const path = pathParts.join("/");
    // Forward exact path to backend, preserving trailing slash from original request
    const originalPathname = request.nextUrl.pathname;
    const hasTrailingSlash = originalPathname.endsWith("/");
    const url = `${backendUrl}/${path}${hasTrailingSlash ? "/" : ""}`;

    // Get the request body if it exists
    let body;
    if (method !== "GET" && method !== "DELETE") {
      try {
        body = await request.text();
        // Nie loguj pełnych treści (mogą zawierać hasła/tokeny)
        console.log("Request body length:", body?.length || 0);
        console.log("Request body type:", typeof body);
      } catch (error) {
        // If there's no body, that's fine
        body = undefined;
      }
    }

    // Forward headers (including Authorization)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Forward important headers but not host-specific ones
      if (
        !["host", "connection", "content-length"].includes(key.toLowerCase())
      ) {
        headers[key] = value;
      }
    });

    // Add search params
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    console.log(`Proxying ${method} request to: ${fullUrl}`);
    console.log("Content-Type being sent:", headers["content-type"]);
    console.log("Path parts:", pathParts);
    console.log("Path:", path);
    if (body === undefined) {
      console.log("No body content");
    }

    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
    });

    const responseText = await response.text();

    console.log(`Backend response status: ${response.status}`);

    // Create response with same status and headers
    const proxyResponse = new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward response headers
    response.headers.forEach((value, key) => {
      proxyResponse.headers.set(key, value);
    });

    return proxyResponse;
  } catch (error) {
    console.error("Backend proxy error:", error);
    return NextResponse.json(
      { error: "Backend service unavailable" },
      { status: 503 }
    );
  }
}
