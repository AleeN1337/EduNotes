import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Ścieżki wymagające autentyfikacji
  const protectedPaths = ["/dashboard", "/organizations"];
  const currentPath = request.nextUrl.pathname;

  // Sprawdź czy ścieżka wymaga autentyfikacji
  const isProtectedPath = protectedPaths.some((path) =>
    currentPath.startsWith(path)
  );

  if (isProtectedPath) {
    // Sprawdź czy istnieje token w cookies (nie możemy sprawdzić localStorage w middleware)
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      // Przekieruj do strony logowania
      const loginUrl = new URL("/", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
