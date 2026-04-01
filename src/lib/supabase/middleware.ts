import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/admin", "/dashboard"];
const AUTH_ROUTES = ["/login"];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check for auth token cookie (set by /api/auth/login)
  const hasSession = request.cookies.has("sb-access-token");

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtected && !hasSession) {
    const redirectTo = pathname.startsWith("/admin")
      ? "/login/admin"
      : "/login/trainer";
    const url = request.nextUrl.clone();
    url.pathname = redirectTo;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login pages
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
