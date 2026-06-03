/**
 * Server-side guards for API route handlers.
 *
 *   const guard = requireAdmin(req);
 *   if (guard) return guard;  // 403 response — admin missing
 *
 * Keeps the gating logic identical across endpoints and surfaces a clear
 * error shape consumers can check.
 */

import { NextResponse } from "next/server";
import { getCurrentRoleFromRequest } from "./permissions";

export function requireAdmin(req: Request): NextResponse | null {
  const role = getCurrentRoleFromRequest(req);
  if (role !== "admin") {
    return NextResponse.json(
      {
        error: "Admin role required",
        role,
        hint: "Sign in with an account that has the admin role to use this endpoint."
      },
      { status: 403 }
    );
  }
  return null;
}
