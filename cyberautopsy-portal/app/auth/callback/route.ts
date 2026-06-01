import { NextRequest, NextResponse } from "next/server";
import { verifySession, ttlSecondsFromPayload, SESSION_COOKIE } from "@/lib/auth/session";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Token handoff target. Marketing site issues a signed token after MFA;
 * we verify it here, set an HttpOnly cookie scoped to this origin,
 * and redirect to the dashboard (or returnTo if present).
 *
 * Behind Nginx in production, `req.url` carries Next's listening URL
 * (localhost:3100), not the public hostname. Use the Host header (which
 * Nginx forwards via `proxy_set_header Host $host;`) to build redirects.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const returnTo = req.nextUrl.searchParams.get("returnTo") || "/dashboard";

  if (!token) {
    return NextResponse.redirect(selfUrl(req, "/signed-out?reason=missing"));
  }

  const payload = await verifySession(token);
  if (!payload) {
    return NextResponse.redirect(selfUrl(req, "/signed-out?reason=invalid"));
  }

  const dest = sanitizeReturnTo(returnTo);
  const targetUrl = selfUrl(req, dest);
  const res = NextResponse.redirect(targetUrl);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: targetUrl.protocol === "https:",
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

/**
 * Build a same-origin absolute URL using the public Host (forwarded by Nginx),
 * not Node's listening address. Falls back to req.nextUrl in dev where there's
 * no proxy.
 */
function selfUrl(req: NextRequest, path: string): URL {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (forwardedHost) {
    const proto = forwardedProto ?? "https";
    return new URL(path, `${proto}://${forwardedHost}`);
  }
  return new URL(path, req.url);
}
