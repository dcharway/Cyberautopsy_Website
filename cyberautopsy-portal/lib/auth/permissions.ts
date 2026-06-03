/**
 * Role-based access control for the portal.
 *
 * The middleware already validated the session cookie and forwarded the
 * user's role via the x-cyber-role header. These helpers let server
 * components and route handlers read it and gate features without
 * re-verifying the cookie.
 */

import { headers } from "next/headers";
import type { Role } from "./session";

export type CurrentUser = {
  email: string;
  mfa: "totp" | "webauthn";
  role: Role;
};

/** Read the current user from request headers (set by middleware). */
export function getCurrentUser(): CurrentUser {
  const h = headers();
  const email = h.get("x-cyber-user") ?? "unknown";
  const mfa = (h.get("x-cyber-mfa") as "totp" | "webauthn" | null) ?? "totp";
  const role = roleFromString(h.get("x-cyber-role"));
  return { email, mfa, role };
}

/** Read the current user's role from a Request (in API route handlers). */
export function getCurrentRoleFromRequest(req: Request): Role {
  return roleFromString(req.headers.get("x-cyber-role"));
}

function roleFromString(value: string | null): Role {
  if (value === "admin" || value === "demo" || value === "viewer") return value;
  return "viewer";
}

/* ---------- capability checks ---------- */

/**
 * Capabilities the GRC portal gates by role.
 * Add new capabilities here as features grow.
 */
export const CAPABILITY = {
  // Read-only browsing of dashboard, controls, evidence, POA&M, assessments
  VIEW_DASHBOARD: "view_dashboard",
  // Edit control statuses, owners, narratives
  EDIT_CONTROLS: "edit_controls",
  // Upload, version, retire evidence artifacts
  MANAGE_EVIDENCE: "manage_evidence",
  // Create / move POA&M items
  MANAGE_POAM: "manage_poam",
  // Drive the CAP workflow (advance phases, accept findings)
  RUN_ASSESSMENT: "run_assessment",
  // Generate SSP / POA&M / Evidence Matrix / Packet exports
  EXPORT_REPORTS: "export_reports",
  // Bulk import controls (CSV/XLSX → 110-control registry)
  IMPORT_CONTROLS: "import_controls",
  // User management, integration settings, organization admin
  ADMIN_PANEL: "admin_panel"
} as const;

export type Capability = (typeof CAPABILITY)[keyof typeof CAPABILITY];

const ROLE_CAPS: Record<Role, Capability[]> = {
  admin: [
    CAPABILITY.VIEW_DASHBOARD,
    CAPABILITY.EDIT_CONTROLS,
    CAPABILITY.MANAGE_EVIDENCE,
    CAPABILITY.MANAGE_POAM,
    CAPABILITY.RUN_ASSESSMENT,
    CAPABILITY.EXPORT_REPORTS,
    CAPABILITY.IMPORT_CONTROLS,
    CAPABILITY.ADMIN_PANEL
  ],
  demo: [
    CAPABILITY.VIEW_DASHBOARD
  ],
  viewer: [
    CAPABILITY.VIEW_DASHBOARD
  ]
};

export function can(role: Role, capability: Capability): boolean {
  return ROLE_CAPS[role].includes(capability);
}

export function isAdmin(role: Role): boolean {
  return role === "admin";
}

export function isDemo(role: Role): boolean {
  return role === "demo";
}
