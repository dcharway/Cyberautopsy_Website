import { NextResponse } from "next/server";
import { DEMO } from "@/lib/auth/store";
import { totpProvisioningUri } from "@/lib/auth/totp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Exposes the demo user's TOTP provisioning URI so the sign-in page can
 * render a QR-code / one-click-enroll panel. In production this endpoint
 * does not exist — TOTP enrollment is a separate authenticated flow.
 */
export async function GET() {
  const otpauthUri = totpProvisioningUri(DEMO.totpSecret, DEMO.totpLabel, DEMO.totpIssuer);
  return NextResponse.json({
    email: DEMO.email,
    password: DEMO.password,
    secret: DEMO.totpSecret,
    issuer: DEMO.totpIssuer,
    label: DEMO.totpLabel,
    otpauthUri
  });
}
