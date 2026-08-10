import Link from "next/link";
import { getCurrentUser, isAdmin } from "@/lib/auth/permissions";
import { AdminLockScreen } from "@/components/ui/AdminLockScreen";
import { loadActive, getAssessment } from "@/lib/assessments";
import { getClient } from "@/lib/clients";
import { loadCUI } from "@/lib/cui-store";
import { determine, CUI_SECTIONS, CUI_CATEGORIES } from "@/data/cui-determination";
import { CUIWorkspace } from "./CUIWorkspace";

export const metadata = { title: "CUI Determination · CyberAutopsy Portal" };
export const dynamic = "force-dynamic";

export default async function CUIDeterminationPage() {
  const { role } = getCurrentUser();
  if (!isAdmin(role)) {
    return (
      <AdminLockScreen
        feature="CUI Determination"
        description="Determine whether an information asset is Controlled Unclassified Information (Basic or Specified) under 32 CFR Part 2002, DoDI 5200.48, and the NARA CUI Registry — and what NIST + CMMC requirements follow. Admin-only."
      />
    );
  }

  const active = await loadActive();
  if (!active.assessmentId) {
    return (
      <div className="space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
            CUI DETERMINATION
          </div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            No active assessment.
          </h1>
        </header>
        <section className="border border-gold-300/40 bg-ink-900 p-8 shadow-gilt text-center">
          <p className="text-sm text-bone-200">
            Pick a client + assessment first — this determination is stored per assessment.
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
    loadCUI(active.assessmentId)
  ]);

  return (
    <CUIWorkspace
      assessmentId={active.assessmentId}
      clientName={client?.organization ?? ""}
      reportingPeriod={assessment?.reportingPeriod ?? ""}
      sections={CUI_SECTIONS}
      categories={CUI_CATEGORIES}
      initialState={state}
      initialDetermination={determine(state.answers, state.selectedCategoryCodes)}
    />
  );
}
