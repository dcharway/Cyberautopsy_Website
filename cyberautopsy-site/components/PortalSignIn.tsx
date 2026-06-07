"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn
} from "@simplewebauthn/browser";
import {
  KeyRound,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  ExternalLink,
  Copy,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "identity" | "method" | "key" | "totp" | "success";
type Method = "key" | "totp";

type DemoInfo = {
  email: string;
  password: string;
  secret: string;
  issuer: string;
  label: string;
  otpauthUri: string;
};

export function PortalSignIn() {
  const [step, setStep] = useState<Step>("identity");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasWebAuthnKey, setHasWebAuthnKey] = useState(false);

  // MFA state
  const [keyStatus, setKeyStatus] = useState<"idle" | "waiting" | "verified" | "error">("idle");
  const [keyError, setKeyError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  // Label written into the user record so the admin can later distinguish
  // multiple registered keys (e.g. "YubiKey 5C" vs "Touch ID — Macbook").
  // Default to a generic name; the pre-flight form lets the user change it
  // before the WebAuthn ceremony begins.
  const [keyLabel, setKeyLabel] = useState("YubiKey");

  const [totp, setTotp] = useState<string[]>(["", "", "", "", "", ""]);
  const [totpError, setTotpError] = useState<string | null>(null);

  // Success
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Demo panel data
  const [demo, setDemo] = useState<DemoInfo | null>(null);
  const [demoCopied, setDemoCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/totp/info")
      .then((r) => r.json())
      .then(setDemo)
      .catch(() => {});
  }, []);

  /* ---------- step 1: identity ---------- */
  async function submitIdentity(e: React.FormEvent) {
    e.preventDefault();
    setIdentityError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setHasWebAuthnKey(Boolean(data.methods?.webauthn));
      setStep("method");
    } catch (err) {
      setIdentityError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- step 2: method ---------- */
  async function pickMethod(m: Method) {
    if (m === "totp") {
      setTotpError(null);
      setStep("totp");
      return;
    }
    // Security key path
    if (!browserSupportsWebAuthn()) {
      setKeyError("This browser does not support WebAuthn. Use TOTP instead.");
      setStep("key");
      return;
    }
    setKeyError(null);
    if (!hasWebAuthnKey) {
      // No key yet — surface the label form first so the user can name the
      // key (e.g. "YubiKey 5C") BEFORE the browser ceremony starts. The
      // ceremony fires when they click "Begin enrollment".
      setRegistering(true);
      setKeyStatus("idle");
      setStep("key");
    } else {
      await authenticateKey();
    }
  }

  /* ---------- step 3a: WebAuthn register + authenticate ---------- */
  async function registerKey() {
    setStep("key");
    setKeyStatus("waiting");
    setKeyError(null);
    setRegistering(true);
    const labelToSave = keyLabel.trim() || "Primary security key";
    try {
      const optsRes = await fetch("/api/auth/webauthn/register-begin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const opts = await optsRes.json();
      if (!optsRes.ok) throw new Error(opts.error || "Failed to begin registration");

      const attResp = await startRegistration({ optionsJSON: opts });

      const finishRes = await fetch("/api/auth/webauthn/register-finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, response: attResp, label: labelToSave })
      });
      const finishData = await finishRes.json();
      if (!finishRes.ok) throw new Error(finishData.error || "Registration failed");

      setHasWebAuthnKey(true);
      // Now run the authenticate ceremony to actually sign in
      await authenticateKey();
    } catch (err) {
      setKeyStatus("error");
      setKeyError(err instanceof Error ? err.message : "Registration cancelled");
    } finally {
      setRegistering(false);
    }
  }

  async function authenticateKey() {
    setStep("key");
    setKeyStatus("waiting");
    setKeyError(null);
    try {
      const optsRes = await fetch("/api/auth/webauthn/authenticate-begin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const opts = await optsRes.json();
      if (!optsRes.ok) throw new Error(opts.error || "Failed to begin authentication");

      const assResp = await startAuthentication({ optionsJSON: opts });

      const finishRes = await fetch("/api/auth/webauthn/authenticate-finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, response: assResp })
      });
      const finishData = await finishRes.json();
      if (!finishRes.ok) throw new Error(finishData.error || "Authentication failed");

      setKeyStatus("verified");
      setCallbackUrl(finishData.callbackUrl);
      setTimeout(() => setStep("success"), 600);
    } catch (err) {
      setKeyStatus("error");
      setKeyError(err instanceof Error ? err.message : "Authentication cancelled");
    }
  }

  /* ---------- step 3b: TOTP ---------- */
  async function submitTotp(e: React.FormEvent) {
    e.preventDefault();
    setTotpError(null);
    const code = totp.join("");
    if (!/^\d{6}$/.test(code)) {
      setTotpError("Enter the 6-digit code from your authenticator.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/totp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setCallbackUrl(data.callbackUrl);
      setStep("success");
    } catch (err) {
      setTotpError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- step 4: success ---------- */
  useEffect(() => {
    if (step !== "success" || !callbackUrl) return;
    if (countdown === 0) {
      window.location.href = callbackUrl;
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, callbackUrl, countdown]);

  const stepIndex: Record<Step, number> = { identity: 1, method: 2, key: 3, totp: 3, success: 4 };

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setDemoCopied(label);
      setTimeout(() => setDemoCopied(null), 1400);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950 via-ink-950 to-ink-900" />

      <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 py-16 lg:grid-cols-[1fr_1.2fr] lg:px-10 lg:py-24">
        {/* LEFT — demo credentials panel */}
        <aside className="space-y-6">
          <div>
            <span className="classified-stamp">CLIENT PORTAL · CUI ENCLAVE</span>
            <h1 className="mt-6 font-serif text-4xl leading-[1.04] tracking-tightest text-bone-50 lg:text-5xl">
              Sign in to the <span className="gold-text">GRC workspace.</span>
            </h1>
            <p className="mt-4 max-w-md text-bone-300">
              Multi-factor authentication enforced. Sessions logged per DFARS 252.204-7012.
            </p>
          </div>

          {demo && (
            <div className="border border-gold-300/40 bg-gold-300/5 p-5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-gold-300">
                <Info size={12} />
                DEMO CREDENTIALS
              </div>
              <p className="mt-2 text-xs text-bone-300">
                Pre-provisioned demo account. Real password hashing (scrypt) and real RFC 6238
                TOTP — scan the secret into Microsoft Authenticator, Authy, or 1Password.
              </p>

              <dl className="mt-4 space-y-3">
                <CopyRow label="Email" value={demo.email} onCopy={copy} copied={demoCopied} />
                <CopyRow label="Password" value={demo.password} onCopy={copy} copied={demoCopied} />
                <CopyRow label="TOTP secret" value={demo.secret} onCopy={copy} copied={demoCopied} mono />
              </dl>

              <a
                href={demo.otpauthUri}
                className="mt-4 inline-flex items-center gap-2 border border-gold-300/40 bg-ink-900 px-3 py-2 text-xs text-gold-100 hover:bg-gold-300 hover:text-ink-950"
              >
                <Smartphone size={12} /> Open in authenticator app
              </a>
              <p className="mt-2 text-[10px] text-bone-400">
                Mobile only · opens any authenticator app that handles otpauth:// URIs.
              </p>
            </div>
          )}

          <ul className="space-y-3 text-sm">
            {[
              { t: "FIPS-validated cryptography", d: "Scrypt password hashing · HMAC-SHA256 session tokens." },
              { t: "Real WebAuthn / FIDO2", d: "navigator.credentials ceremony · public-key on server." },
              { t: "Cross-origin handoff", d: "Marketing site issues a signed token, portal at :3100 validates it." }
            ].map((x) => (
              <li key={x.t} className="flex gap-3">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rotate-45 bg-gold-300 shrink-0" aria-hidden />
                <div>
                  <div className="text-bone-100">{x.t}</div>
                  <div className="text-xs text-bone-400">{x.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* RIGHT — auth card */}
        <div className="relative">
          <div className="border border-gold-300/40 bg-ink-900 p-8 shadow-gilt sm:p-10">
            <header className="flex items-center justify-between gap-3 border-b border-ink-700 pb-5">
              <div className="flex items-center gap-2">
                <Mark />
                <div>
                  <div className="font-serif text-base tracking-tightest text-bone-50">CyberAutopsy</div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-gold-300/80">
                    GRC WORKSPACE · L2
                  </div>
                </div>
              </div>
              <div className="font-mono text-[10px] tracking-widest2 text-bone-400">
                STEP {String(stepIndex[step]).padStart(2, "0")} / 04
              </div>
            </header>

            <div className="mt-4 grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn("h-0.5 transition", i <= stepIndex[step] ? "bg-gold-300" : "bg-ink-700")}
                  aria-hidden
                />
              ))}
            </div>

            <div className="mt-8 min-h-[340px]">
              <AnimatePresence mode="wait">
                {step === "identity" && (
                  <motion.form
                    key="identity"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    onSubmit={submitIdentity}
                    className="space-y-5"
                    noValidate
                  >
                    <h2 className="font-serif text-2xl text-bone-50">Identify yourself</h2>
                    <p className="text-xs text-bone-400">
                      Sign in with the demo credentials at left, or with your provisioned client account.
                    </p>

                    <Field label="Work email">
                      <input
                        type="email"
                        autoFocus
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="demo@cyberautopsy.com"
                        autoComplete="username"
                        className="w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 placeholder:text-bone-400 focus:border-gold-300 focus:outline-none"
                      />
                    </Field>

                    <Field label="Password">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="cyberautopsy-demo"
                        autoComplete="current-password"
                        className="w-full border border-ink-700 bg-ink-950 px-3 py-3 text-sm text-bone-100 placeholder:text-bone-400 focus:border-gold-300 focus:outline-none"
                      />
                    </Field>

                    {identityError && (
                      <div role="alert" className="border border-status-failed/60 bg-status-failedBg p-2 text-xs text-bone-100">
                        {identityError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-2 inline-flex w-full items-center justify-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
                    >
                      {submitting ? "Verifying…" : (<>Continue <ArrowRight size={14} /></>)}
                    </button>

                    <p className="text-center text-[11px] text-bone-400">
                      <a href="/portal/forgot" className="text-gold-300 hover:text-gold-100 underline-offset-2 hover:underline">
                        Forgot password?
                      </a>{" "}
                      Or contact your assigned Compliance Surgeon.
                    </p>
                  </motion.form>
                )}

                {step === "method" && (
                  <motion.div
                    key="method"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <h2 className="font-serif text-2xl text-bone-50">Confirm your identity</h2>
                    <p className="mt-1 text-xs text-bone-400">
                      Two-factor authentication is required per NIST 800-171 §3.5.3.
                    </p>

                    <div className="mt-6 grid gap-3">
                      <button
                        type="button"
                        onClick={() => pickMethod("key")}
                        className="group flex items-start gap-4 border border-gold-300/40 bg-gold-300/5 p-4 text-left transition hover:bg-gold-300/10"
                      >
                        <span className="flex h-10 w-10 items-center justify-center border border-gold-300/60 text-gold-300">
                          <KeyRound size={16} />
                        </span>
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="font-serif text-lg text-bone-50">Security key</span>
                            <span className="font-mono text-[9px] tracking-widest2 text-gold-300 border border-gold-300/50 px-1.5 py-0.5">
                              {hasWebAuthnKey ? "REGISTERED" : "REGISTER NEW"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-bone-300">
                            {hasWebAuthnKey
                              ? "Use your registered key — TouchID, Windows Hello, or a YubiKey."
                              : "Register a new key with TouchID, Windows Hello, or a YubiKey. Real navigator.credentials ceremony."}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => pickMethod("totp")}
                        className="group flex items-start gap-4 border border-ink-700 p-4 text-left transition hover:border-bone-300"
                      >
                        <span className="flex h-10 w-10 items-center justify-center border border-ink-700 text-bone-300">
                          <Smartphone size={16} />
                        </span>
                        <div className="flex-1">
                          <span className="font-serif text-lg text-bone-50">Authenticator app</span>
                          <p className="mt-1 text-xs text-bone-300">
                            6-digit TOTP from Microsoft Authenticator, Authy, or 1Password.
                          </p>
                        </div>
                      </button>
                    </div>

                    <BackLink onClick={() => setStep("identity")} label="Switch user" />
                  </motion.div>
                )}

                {step === "key" && registering && keyStatus === "idle" && (
                  <motion.div
                    key="key-label"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <h2 className="font-serif text-2xl text-bone-50">Name this security key</h2>
                    <p className="mt-1 text-xs text-bone-400">
                      One enrollment per key. The label is recorded with the credential so you can
                      identify it later if you register more than one.
                    </p>

                    <label className="mt-6 block">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
                        Key name
                      </span>
                      <input
                        autoFocus
                        type="text"
                        value={keyLabel}
                        onChange={(e) => setKeyLabel(e.target.value)}
                        maxLength={64}
                        placeholder="YubiKey 5C — admin"
                        className="mt-2 w-full border border-ink-700 bg-ink-950 px-3 py-2.5 text-sm text-bone-100 placeholder:text-bone-500 focus:border-gold-300 focus:outline-none"
                      />
                    </label>

                    <div className="mt-3 flex items-center gap-2 border border-ink-700 bg-ink-950 px-3 py-2 text-[11px] text-bone-300">
                      <Info size={12} className="text-gold-300 shrink-0" />
                      <span>
                        Plug the YubiKey in <strong className="text-bone-100">before</strong> you click
                        Begin. The browser will prompt; tap the gold disc when it blinks.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => registerKey()}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200"
                    >
                      Begin enrollment <ArrowRight size={14} />
                    </button>

                    <BackLink onClick={() => { setRegistering(false); setStep("method"); }} label="Back" />
                  </motion.div>
                )}

                {step === "key" && !(registering && keyStatus === "idle") && (
                  <motion.div
                    key="key"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="text-center"
                  >
                    <h2 className="font-serif text-2xl text-bone-50">
                      {keyStatus === "verified"
                        ? "Verified"
                        : registering
                        ? "Register your security key"
                        : "Touch your security key"}
                    </h2>
                    <p className="mt-2 text-xs text-bone-400">
                      {registering
                        ? `Follow the browser prompt to enroll "${keyLabel.trim() || "Primary security key"}". Tap the key when it blinks.`
                        : "Insert the key and tap, or use your platform authenticator."}
                    </p>

                    <div className="mt-10 flex items-center justify-center">
                      <div className="relative">
                        <span
                          className={cn(
                            "absolute inset-0 -m-8 rounded-full border",
                            keyStatus === "waiting"
                              ? "border-gold-300/30 animate-pulse-slow"
                              : keyStatus === "verified"
                              ? "border-status-met/50"
                              : "border-status-failed/50"
                          )}
                          aria-hidden
                        />
                        <span
                          className={cn(
                            "relative flex h-24 w-24 items-center justify-center border-2 transition",
                            keyStatus === "verified"
                              ? "border-status-met bg-status-metBg"
                              : keyStatus === "error"
                              ? "border-status-failed bg-status-failedBg"
                              : "border-gold-300 bg-gold-300/10"
                          )}
                        >
                          {keyStatus === "verified" ? (
                            <Check size={36} className="text-status-met" />
                          ) : (
                            <KeyRound
                              size={36}
                              className={keyStatus === "error" ? "text-status-failed" : "text-gold-300"}
                            />
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-10 font-mono text-[10px] tracking-widest2 text-bone-400">
                      {keyStatus === "verified"
                        ? "VERIFIED"
                        : keyStatus === "error"
                        ? "FAILED"
                        : registering
                        ? "REGISTRATION IN PROGRESS…"
                        : "WAITING FOR TAP…"}
                    </div>

                    {keyError && (
                      <div className="mt-4 mx-auto max-w-sm border border-status-failed/60 bg-status-failedBg p-3 text-xs text-bone-100">
                        {keyError}
                      </div>
                    )}

                    <div className="mt-8 flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setKeyStatus("idle");
                          setKeyError(null);
                          setRegistering(false);
                          setStep("method");
                        }}
                        disabled={keyStatus === "verified"}
                        className="font-mono text-[10px] tracking-widest2 text-bone-400 hover:text-bone-100 disabled:opacity-50"
                      >
                        ← CANCEL
                      </button>
                      {keyStatus === "error" && (
                        <button
                          type="button"
                          onClick={() => (hasWebAuthnKey ? authenticateKey() : registerKey())}
                          className="font-mono text-[10px] tracking-widest2 text-gold-300 hover:text-gold-100"
                        >
                          RETRY →
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === "totp" && (
                  <motion.form
                    key="totp"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    onSubmit={submitTotp}
                  >
                    <h2 className="font-serif text-2xl text-bone-50">Enter authenticator code</h2>
                    <p className="mt-1 text-xs text-bone-400">
                      Real RFC 6238 verification · 30-second window · ±1 step skew tolerance.
                    </p>

                    <TOTPInput value={totp} onChange={setTotp} />

                    {totpError && (
                      <div role="alert" className="mt-4 border border-status-failed/60 bg-status-failedBg p-2 text-xs text-bone-100">
                        {totpError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200 disabled:opacity-60"
                    >
                      {submitting ? "Verifying…" : (<>Verify <ArrowRight size={14} /></>)}
                    </button>

                    <div className="mt-4 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => pickMethod("key")}
                        className="text-gold-300 hover:text-gold-100"
                      >
                        Use security key instead
                      </button>
                      <BackLink onClick={() => setStep("method")} label="Back" inline />
                    </div>
                  </motion.form>
                )}

                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-status-met bg-status-metBg">
                      <Check size={28} className="text-status-met" />
                    </div>
                    <h2 className="mt-6 font-serif text-2xl text-bone-50">
                      Welcome back, {email}.
                    </h2>
                    <p className="mt-2 text-sm text-bone-300">
                      Session signed. Routing to the GRC workspace in{" "}
                      <span className="font-mono text-gold-300">{countdown}s</span>.
                    </p>

                    <div className="mt-8 flex flex-col items-stretch gap-2">
                      <a
                        href={callbackUrl ?? "#"}
                        className="inline-flex items-center justify-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200"
                      >
                        Open GRC portal now <ArrowRight size={14} />
                      </a>
                      <a
                        href={callbackUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 border border-gold-300/40 bg-gold-300/5 px-5 py-2.5 text-xs text-gold-100 hover:bg-gold-300 hover:text-ink-950"
                      >
                        Open in new tab <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="mt-8 border-t border-ink-700 pt-5 font-mono text-[10px] tracking-widest2 text-bone-400">
                      SESSION LOGGED · DFARS 7012 RETENTION POLICY
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-bone-400">
            U.S. Government property. Authorized users only. Unauthorized access is prosecutable
            under 18 U.S.C. §1030.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-bone-400">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function BackLink({ onClick, label, inline = false }: { onClick: () => void; label: string; inline?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[10px] tracking-widest2 text-bone-400 hover:text-bone-100",
        inline ? "" : "mt-8 block"
      )}
    >
      <ArrowLeft size={11} />
      {label.toUpperCase()}
    </button>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
  copied,
  mono = false
}: {
  label: string;
  value: string;
  onCopy: (v: string, k: string) => void;
  copied: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-700 pb-3 last:border-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{label}</div>
        <div className={cn("mt-1 truncate text-xs text-bone-100", mono && "font-mono")}>{value}</div>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value, label)}
        className="shrink-0 inline-flex items-center gap-1 border border-ink-700 px-2 py-1 font-mono text-[10px] tracking-widest2 text-bone-300 hover:border-gold-300 hover:text-gold-300"
      >
        <Copy size={11} />
        {copied === label ? "COPIED" : "COPY"}
      </button>
    </div>
  );
}

function TOTPInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function setAt(i: number, v: string) {
    const next = [...value];
    next[i] = v.slice(-1);
    onChange(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((ch, i) => (next[i] = ch));
    onChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  }

  return (
    <div className="mt-5 flex justify-center gap-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i]}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1} of 6`}
          onChange={(e) => setAt(i, e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className="h-14 w-12 border border-ink-700 bg-ink-950 text-center font-mono text-2xl text-bone-50 focus:border-gold-300 focus:outline-none"
        />
      ))}
    </div>
  );
}

function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden focusable="false">
      <defs>
        <linearGradient id="signin-chrome" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#F7F9FA" />
          <stop offset="35%" stopColor="#D5DCE2" />
          <stop offset="65%" stopColor="#A6B0B9" />
          <stop offset="100%" stopColor="#5E6770" />
        </linearGradient>
        <linearGradient id="signin-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2B313A" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="signin-cyan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
      </defs>
      <path
        d="M32 6 L52 13 V30 C52 43 43 53 32 58 C21 53 12 43 12 30 V13 Z"
        fill="url(#signin-chrome)"
        stroke="url(#signin-edge)"
        strokeWidth="1.2"
      />
      <path
        d="M32 10 L48 16 V30 C48 41 40 49 32 53 C24 49 16 41 16 30 V16 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="0.8"
      />
      <path
        d="M14 32 H22 L26 24 L30 40 L34 18 L38 38 L42 28 H50"
        fill="none"
        stroke="#22D3EE"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.18"
      />
      <path
        d="M14 32 H22 L26 24 L30 40 L34 18 L38 38 L42 28 H50"
        fill="none"
        stroke="url(#signin-cyan)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
