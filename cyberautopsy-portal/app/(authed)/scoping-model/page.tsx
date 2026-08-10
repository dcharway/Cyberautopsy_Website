import Link from "next/link";
import { getCurrentUser, isAdmin } from "@/lib/auth/permissions";
import { AdminLockScreen } from "@/components/ui/AdminLockScreen";
import { loadActive, getAssessment } from "@/lib/assessments";
import { getClient } from "@/lib/clients";
import { loadScoping } from "@/lib/scoping-store";
import { summarize } from "@/data/scoping-model";
import { ScopingWorkspace } from "./ScopingWorkspace";

export const metadata = { title: "Scoping Model · CyberAutopsy Portal" };
export const dynamic = "force-dynamic";

export default async function ScopingPage() {
  const { role } = getCurrentUser();
  if (!isAdmin(role)) {
    return (
      <AdminLockScreen
        feature="FCI / CUI Scoping Model"
        description="Inventory applications, technology, and people and classify each as in-scope or out-of-scope for FCI or CUI per the DoD CMMC Assessment Scope Guide. Admin-only."
      />
    );
  }

  const active = await loadActive();
  if (!active.assessmentId) {
    return (
      <div className="space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            SCOPING MODEL
          </div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            No active assessment.
          </h1>
        </header>
        <section className="border border-gold-300/40 bg-ink-900 p-8 shadow-gilt text-center">
          <p className="text-sm text-bone-200">
            Pick a client + assessment first — the scoping model is stored per assessment.
          </p>
          <Link
            href="/admin/clients"
            className="mt-4 inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200"
          >
            Open clients workspace →
          </Link>
        </section>
      </div>
    );
  }

  const [client, assessment, state] = await Promise.all([
    active.clientId ? getClient(active.clientId) : Promise.resolve(null),
    getAssessment(active.assessmentId),
    loadScoping(active.assessmentId)
  ]);

  return (
    <ScopingWorkspace
      assessmentId={active.assessmentId}
      clientName={client?.organization ?? ""}
      reportingPeriod={assessment?.reportingPeriod ?? ""}
      initialState={state}
      initialSummary={summarize(state.items)}
    />
  );
}
