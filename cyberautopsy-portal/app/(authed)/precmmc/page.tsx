import Link from "next/link";
import { getCurrentUser, isAdmin } from "@/lib/auth/permissions";
import { AdminLockScreen } from "@/components/ui/AdminLockScreen";
import { loadActive, getAssessment } from "@/lib/assessments";
import { getClient } from "@/lib/clients";
import { loadPreCMMC, computeReadiness } from "@/lib/precmmc-store";
import { PRECMMC_SECTIONS, DIAGRAM_SLOTS, UPLOAD_RULES, TOTAL_CHECKLIST_ITEMS } from "@/data/precmmc-checklist";
import { PreCMMCWorkspace } from "./PreCMMCWorkspace";

export const metadata = { title: "Pre-CMMC Checklist · CyberAutopsy Portal" };
export const dynamic = "force-dynamic";

export default async function PreCMMCPage() {
  const { role } = getCurrentUser();
  if (!isAdmin(role)) {
    return (
      <AdminLockScreen
        feature="Pre-CMMC Assessment Checklist"
        description="The four-to-six-week pre-assessment readiness walkthrough with required diagram uploads, per-control evidence pointers, and the Go / No-Go gate is restricted to admin users."
      />
    );
  }

  const active = await loadActive();
  if (!active.assessmentId) {
    return (
      <div className="space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">PRE-CMMC CHECKLIST</div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            No active assessment.
          </h1>
        </header>
        <section className="border border-gold-300/40 bg-ink-900 p-8 text-center shadow-gilt">
          <p className="text-sm text-bone-200">
            Pick a client + assessment first; the Pre-CMMC checklist tracks state per assessment.
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
    loadPreCMMC(active.assessmentId)
  ]);

  // Pre-fill the header from active engagement when the checklist is empty
  // so the user isn't typing the client name twice.
  const hydratedHeader = {
    client: state.header.client || client?.organization || "",
    date: state.header.date || new Date().toISOString().slice(0, 10),
    inScopeSystems: state.header.inScopeSystems || assessment?.notes || "",
    assessor: state.header.assessor || assessment?.assessor || ""
  };

  const readiness = computeReadiness({ ...state, header: hydratedHeader });

  return (
    <PreCMMCWorkspace
      assessmentId={active.assessmentId}
      clientName={client?.organization ?? ""}
      reportingPeriod={assessment?.reportingPeriod ?? ""}
      sections={PRECMMC_SECTIONS}
      diagramSlots={DIAGRAM_SLOTS}
      uploadRules={UPLOAD_RULES}
      totalItems={TOTAL_CHECKLIST_ITEMS}
      initialState={{ ...state, header: hydratedHeader }}
      initialReadiness={readiness}
    />
  );
}
