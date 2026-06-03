import { TopBar } from "@/components/shell/TopBar";
import { LeftNav } from "@/components/shell/LeftNav";
import { DemoBanner } from "@/components/shell/DemoBanner";
import { getCurrentUser } from "@/lib/auth/permissions";

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();

  return (
    <>
      <TopBar userEmail={user.email} mfaMethod={user.mfa} role={user.role} />
      {user.role === "demo" && <DemoBanner />}
      <div className="flex">
        <LeftNav role={user.role} />
        <main id="main" className="min-w-0 flex-1 px-8 py-8">{children}</main>
      </div>
    </>
  );
}
