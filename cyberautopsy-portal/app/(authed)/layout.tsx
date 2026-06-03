import { TopBar } from "@/components/shell/TopBar";
import { LeftNav } from "@/components/shell/LeftNav";
import { DemoBanner } from "@/components/shell/DemoBanner";
import { getCurrentUser } from "@/lib/auth/permissions";
import { loadEngagement } from "@/lib/engagement";

export const dynamic = "force-dynamic";

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  const engagement = await loadEngagement();

  return (
    <>
      <TopBar
        userEmail={user.email}
        mfaMethod={user.mfa}
        role={user.role}
        engagement={{
          name: engagement.organization,
          cage: engagement.cage,
          systemBoundary: engagement.systemBoundary,
          reportingPeriod: engagement.reportingPeriod,
          nextAffirmationDue: engagement.nextAffirmationDue
        }}
      />
      {user.role === "demo" && <DemoBanner />}
      <div className="flex">
        <LeftNav role={user.role} />
        <main id="main" className="min-w-0 flex-1 px-8 py-8">{children}</main>
      </div>
    </>
  );
}
