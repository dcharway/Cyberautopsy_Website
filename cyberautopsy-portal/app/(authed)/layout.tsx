import { headers } from "next/headers";
import { TopBar } from "@/components/shell/TopBar";
import { LeftNav } from "@/components/shell/LeftNav";

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  // Identity forwarded by middleware
  const h = headers();
  const userEmail = h.get("x-cyber-user") ?? "Unknown";
  const mfaMethod = (h.get("x-cyber-mfa") as "totp" | "webauthn" | null) ?? "totp";

  return (
    <>
      <TopBar userEmail={userEmail} mfaMethod={mfaMethod} />
      <div className="flex">
        <LeftNav />
        <main id="main" className="min-w-0 flex-1 px-8 py-8">{children}</main>
      </div>
    </>
  );
}
