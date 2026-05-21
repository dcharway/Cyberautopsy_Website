import Link from "next/link";

export const metadata = { title: "Signed out · CyberAutopsy Portal" };

const REASONS: Record<string, { title: string; body: string }> = {
  user:    { title: "Signed out.",              body: "Your session has been ended." },
  invalid: { title: "Session invalid.",         body: "The handoff token was malformed or expired." },
  missing: { title: "No session token.",        body: "Sign in at the marketing site to get a valid token." }
};

export default function SignedOut({ searchParams }: { searchParams: { reason?: string } }) {
  const r = REASONS[searchParams.reason ?? "user"] ?? REASONS.user;
  const marketingPortal = "http://localhost:3000/portal";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">CYBERAUTOPSY · GRC</div>
      <h1 className="mt-4 font-serif text-4xl tracking-tightest text-bone-50">{r.title}</h1>
      <p className="mt-3 text-sm text-bone-300">{r.body}</p>
      <Link
        href={marketingPortal}
        className="mt-8 inline-flex items-center gap-2 bg-gold-300 px-5 py-3 text-sm font-medium text-ink-950 hover:bg-gold-200"
      >
        Sign in again &rarr;
      </Link>
    </div>
  );
}
