import { getCurrentUser, isAdmin } from "@/lib/auth/permissions";
import { loadActive, getAssessment } from "@/lib/assessments";
import { getClient } from "@/lib/clients";
import { listPOAMs } from "@/lib/poam-store";
import { POAMWorkspace } from "@/components/poam/POAMWorkspace";
import { POAMS } from "@/data/poam";
import { POAMKanban } from "@/components/poam/POAMKanban";

export const metadata = { title: "POA&M · CyberAutopsy Portal" };
export const dynamic = "force-dynamic";

export default async function POAMPage() {
  const { role } = getCurrentUser();

  // Demo / viewer users see the read-only kanban over the canned seed.
  if (!isAdmin(role)) {
    const total = POAMS.length;
    return (
      <div className="space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            PLAN OF ACTION &amp; MILESTONES
          </div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            POA&amp;M workflow.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-bone-300">
            Demo view — drag-style controls work locally but changes do not persist.
            Sign in as an admin to register clients, scope assessments, and run real
            POA&amp;M tracking with history.
          </p>
        </header>
        <POAMKanban items={POAMS} />
        <p className="text-xs text-bone-400">
          {total} POA&amp;Ms total. CMMC 2.0 permits POA&amp;Ms only on weight-1 controls
          and a limited subset of weight-3, never on weight-5.
        </p>
      </div>
    );
  }

  // Admin: load live data for the active assessment.
  const active = await loadActive();
  const [client, assessment, items] = await Promise.all([
    active.clientId ? getClient(active.clientId) : Promise.resolve(null),
    active.assessmentId ? getAssessment(active.assessmentId) : Promise.resolve(null),
    active.assessmentId ? listPOAMs(active.assessmentId) : Promise.resolve([])
  ]);

  return (
    <POAMWorkspace
      client={client}
      assessment={assessment}
      initialItems={items}
    />
  );
}
