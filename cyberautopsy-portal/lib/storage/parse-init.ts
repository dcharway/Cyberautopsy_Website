/**
 * Lazy Parse SDK initialisation for Back4App.
 *
 * Every store that wants to talk to Back4App calls getParse() and gets either
 * a fully-initialised Parse module or `null` when the env vars aren't set.
 * A null return means the caller should fall back to the filesystem
 * implementation — this is what makes the migration reversible.
 *
 * Env required for Back4App to activate:
 *   STORAGE_BACKEND=back4app
 *   BACK4APP_APP_ID=...
 *   BACK4APP_JAVASCRIPT_KEY=...           // client-callable key
 *   BACK4APP_MASTER_KEY=...               // server-only, full-DB access
 *   BACK4APP_SERVER_URL=https://parseapi.back4app.com   (optional; default shown)
 *
 * If STORAGE_BACKEND is anything other than "back4app", we do NOT initialise
 * even if the keys are present. That way a wrong-branch redeploy can't
 * accidentally start writing to production Back4App.
 */

import Parse from "parse/node";

let initialised = false;
let ready = false;

function initialise(): boolean {
  if (initialised) return ready;
  initialised = true;

  if (process.env.STORAGE_BACKEND !== "back4app") return false;
  const appId = process.env.BACK4APP_APP_ID;
  const jsKey = process.env.BACK4APP_JAVASCRIPT_KEY;
  const masterKey = process.env.BACK4APP_MASTER_KEY;
  const serverUrl = process.env.BACK4APP_SERVER_URL || "https://parseapi.back4app.com/";
  if (!appId || !jsKey) {
    console.warn(
      "[storage/parse] STORAGE_BACKEND=back4app but BACK4APP_APP_ID / BACK4APP_JAVASCRIPT_KEY missing. Falling back to filesystem."
    );
    return false;
  }

  Parse.initialize(appId, jsKey, masterKey);
  (Parse as unknown as { serverURL: string }).serverURL = serverUrl;
  // Master-key auth is applied per-call via { useMasterKey: true } — never
  // globally, so an unauthenticated call can't accidentally elevate.

  ready = true;
  return true;
}

/**
 * Returns the initialised Parse module when Back4App is configured, or
 * null when the caller should fall back to the filesystem implementation.
 */
export function getParse(): typeof Parse | null {
  return initialise() ? Parse : null;
}

/**
 * Whether the caller should use the Back4App backend. Cached so we don't
 * re-check env vars on every request.
 */
export function useBack4App(): boolean {
  return initialise();
}

/** Options object to pass into Parse .save() / .find() / .destroy() for master-key auth. */
export const withMasterKey = { useMasterKey: true } as const;
