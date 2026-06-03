import { getCurrentUser, isAdmin } from "@/lib/auth/permissions";
import { AdminLockScreen } from "@/components/ui/AdminLockScreen";
import { loadEngagement } from "@/lib/engagement";
import { EngagementEditor } from "./EngagementEditor";

export const metadata = { title: "Engagement Settings · CyberAutopsy Portal" };

export default async function EngagementSettingsPage() {
  const { role } = getCurrentUser();
  if (!isAdmin(role)) {
    return (
      <AdminLockScreen
        feature="Engagement settings"
        description="Engagement metadata (client name, CAGE, assessor, dates, affirming official) drives every export template. Restricted to admin users."
      />
    );
  }

  const engagement = await loadEngagement();

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
          ADMIN · ENGAGEMENT TEMPLATE
        </div>
        <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
          Customize the engagement.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bone-300">
          Every export template — SSP, POA&amp;M, Evidence Matrix, Assessment Checklist,
          Affirmation Statement, SPRS Score, C3PAO Packet — populates from these fields.
          Update once per engagement; new exports pick up the change immediately.
        </p>
      </header>

      <EngagementEditor initial={engagement} />
    </div>
  );
}
