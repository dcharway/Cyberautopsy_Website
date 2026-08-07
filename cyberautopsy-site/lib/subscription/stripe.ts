/**
 * Server-side Stripe client. Instantiated lazily so build-time reads (Next
 * static prerender pass) don't crash when the secret key isn't populated
 * (e.g. local dev without .env.local, or the site's marketing prerender
 * running on a machine that never talks to Stripe).
 *
 * Every API route that hits Stripe MUST call getStripe() and gracefully
 * degrade if it returns null.
 */

import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith("sk_")) return null;
  cached = new Stripe(key, {
    // Pin to the release the SDK version was built against. Bump when we
    // upgrade the sdk to avoid silent API-shape drift.
    apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
    typescript: true,
    appInfo: { name: "CyberAutopsy Portal", version: "1.0.0" }
  });
  return cached;
}

/** Absolute URL for a portal-relative path, using MARKETING_URL if set. */
export function marketingUrl(path: string): string {
  const base = (process.env.MARKETING_URL || "https://www.cyberautopsy.org").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_"));
}
