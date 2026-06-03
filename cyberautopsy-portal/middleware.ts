import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth/session";

const MARKETING_BASE = process.env.MARKETING_URL || "http://localhost:3000";

// Routes that do not require a session.
const PUBLIC_PATHS = ["/auth/callback", "/auth/logout", "/signed-out"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySession(token) : null;

  if (!payload) {
    const url = new URL("/portal", MARKETING_BASE);
    url.searchParams.set("returnTo", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Forward identity + role downstream via request header so server
  // components and route handlers can read it without re-verifying the cookie.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-cyber-user", payload.sub);
  requestHeaders.set("x-cyber-mfa", payload.mfa);
  requestHeaders.set("x-cyber-role", payload.role);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on every route except API/static. /api in the portal stays middleware-gated too if you add any.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
