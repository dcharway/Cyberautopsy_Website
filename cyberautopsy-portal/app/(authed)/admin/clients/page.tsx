import { getCurrentUser, isAdmin } from "@/lib/auth/permissions";
import { AdminLockScreen } from "@/components/ui/AdminLockScreen";
import { loadClients } from "@/lib/clients";
import { loadAssessments, loadActive } from "@/lib/assessments";
import { ClientsWorkspace } from "./ClientsWorkspace";

export const metadata = { title: "Clients · CyberAutopsy Portal" };
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { role } = getCurrentUser();
  if (!isAdmin(role)) {
    return (
      <AdminLockScreen
        feature="Clients & Assessments"
        description="Register clients, scope assessments, and switch the active engagement context. Admin-only."
      />
    );
  }

  const [clients, assessments, active] = await Promise.all([
    loadClients(),
    loadAssessments(),
    loadActive()
  ]);

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">CLIENTS &amp; ASSESSMENTS</div>
        <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
          Client roster.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bone-300">
          Register a new OSC, scope an assessment, then click <strong className="text-bone-100">Set active</strong> —
          every dashboard card, POA&amp;M, evidence record, and export instantly keys off the active engagement.
        </p>
      </header>
      <ClientsWorkspace
        initialClients={clients}
        initialAssessments={assessments}
        initialActive={active}
      />
    </div>
  );
}
