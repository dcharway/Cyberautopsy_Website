import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type GenerateAuthenticationOptionsOpts
} from "@simplewebauthn/server";
import { getUser, upsertUser, setUserChallenge } from "./store";

/**
 * WebAuthn config. For localhost dev RPID is "localhost"; origin includes the port.
 * In production set these via env (NEXT_PUBLIC_RP_ID, NEXT_PUBLIC_RP_ORIGIN).
 */
export const RP_ID = process.env.RP_ID || "localhost";
export const RP_NAME = "CyberAutopsy GRC";
export const RP_ORIGIN = process.env.RP_ORIGIN || "http://localhost:3000";

export async function buildRegistrationOptions(email: string) {
  const user = await getUser(email);
  if (!user) throw new Error("User not found");

  const opts: GenerateRegistrationOptionsOpts = {
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: email,
    userDisplayName: email,
    attestationType: "none",
    // Allow either platform (built-in) or cross-platform (security keys)
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred"
    },
    // Exclude already-registered credentials
    excludeCredentials: user.webauthn.map((c) => ({
      id: c.id,
      transports: (c.transports ?? []) as AuthenticatorTransport[]
    }))
  };

  const options = await generateRegistrationOptions(opts);
  await setUserChallenge(email, options.challenge);
  return options;
}

export async function finishRegistration(email: string, response: unknown, label?: string) {
  const user = await getUser(email);
  if (!user || !user.currentChallenge) throw new Error("No challenge in progress");

  const verification = await verifyRegistrationResponse({
    response: response as Parameters<typeof verifyRegistrationResponse>[0]["response"],
    expectedChallenge: user.currentChallenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: false
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error("Registration verification failed");
  }

  const info = verification.registrationInfo;
  user.webauthn.push({
    id: info.credential.id,
    publicKey: Buffer.from(info.credential.publicKey).toString("base64url"),
    counter: info.credential.counter,
    transports: info.credential.transports,
    label: label || "Security key",
    createdAt: new Date().toISOString()
  });
  user.currentChallenge = null;
  await upsertUser(user);
  return { ok: true, credentialId: info.credential.id };
}

export async function buildAuthenticationOptions(email: string) {
  const user = await getUser(email);
  if (!user) throw new Error("User not found");
  if (user.webauthn.length === 0) throw new Error("No security keys registered for this user");

  const opts: GenerateAuthenticationOptionsOpts = {
    rpID: RP_ID,
    userVerification: "preferred",
    allowCredentials: user.webauthn.map((c) => ({
      id: c.id,
      transports: (c.transports ?? []) as AuthenticatorTransport[]
    }))
  };

  const options = await generateAuthenticationOptions(opts);
  await setUserChallenge(email, options.challenge);
  return options;
}

export async function finishAuthentication(email: string, response: unknown) {
  const user = await getUser(email);
  if (!user || !user.currentChallenge) throw new Error("No challenge in progress");

  // Find the credential being used
  const resp = response as { id: string };
  const credential = user.webauthn.find((c) => c.id === resp.id);
  if (!credential) throw new Error("Credential not registered for user");

  const verification = await verifyAuthenticationResponse({
    response: response as Parameters<typeof verifyAuthenticationResponse>[0]["response"],
    expectedChallenge: user.currentChallenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey, "base64url"),
      counter: credential.counter,
      transports: (credential.transports ?? []) as AuthenticatorTransport[]
    },
    requireUserVerification: false
  });

  if (!verification.verified) throw new Error("Authentication verification failed");

  // Update counter and clear challenge
  credential.counter = verification.authenticationInfo.newCounter;
  user.currentChallenge = null;
  await upsertUser(user);

  return { ok: true };
}
