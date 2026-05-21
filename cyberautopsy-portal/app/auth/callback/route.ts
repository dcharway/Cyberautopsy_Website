import { NextRequest, NextResponse } from "next/server";
import { verifySession, ttlSecondsFromPayload, SESSION_COOKIE } from "@/lib/auth/session";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Token handoff target. Marketing site issues a signed token after MFA;
 * we verify it here, set an HttpOnly cookie scoped to this origin (:3100),
 * and redirect to the dashboard (or returnTo if present).
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const returnTo = req.nextUrl.searchParams.get("returnTo") || "/dashboard";

  if (!token) {
    return NextResponse.redirect(new URL("/signed-out?reason=missing", req.url));
  }

  const payload = await verifySession(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/signed-out?reason=invalid", req.url));
  }

  const dest = sanitizeReturnTo(returnTo);
  const res = NextResponse.redirect(new URL(dest, req.url));
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: req.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: ttlSecondsFromPayload(payload)
  });
  return res;
}

function sanitizeReturnTo(path: string): string {
  // Only allow same-origin paths; reject anything that looks like an external redirect.
  if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}
