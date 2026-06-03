import { ControlTable } from "@/components/controls/ControlTable";
import { getCurrentUser, isAdmin } from "@/lib/auth/permissions";
import { mergedControls } from "@/lib/control-state";
import { loadActive } from "@/lib/assessments";
import { listEvidence } from "@/lib/evidence-store";
import { listPOAMs } from "@/lib/poam-store";
import type { FamilyCode } from "@/lib/types";

export const metadata = { title: "Controls · CyberAutopsy Portal" };
export const dynamic = "force-dynamic";

// Server component reads ?family= from the URL, fetches the merged controls
// for the active assessment, and forwards them with role + assessment context
// so the drawer can persist edits.
export default async function ControlsPage({
  searchParams
}: {
  searchParams: { family?: string };
}) {
  const { role } = getCurrentUser();
  const active = await loadActive();
  const [controls, evidence, poams] = await Promise.all([
    mergedControls(active.assessmentId),
    active.assessmentId ? listEvidence(active.assessmentId) : Promise.resolve([]),
    active.assessmentId ? listPOAMs(active.assessmentId) : Promise.resolve([])
  ]);

  const family = (searchParams.family ?? "ALL") as FamilyCode | "ALL";

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">CONTROLS</div>
        <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
          The 110 controls, <span className="gold-text">indexed.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bone-300">
          NIST SP 800-171 Rev. 2, the authoritative inventory for CMMC Level 2. Filter by family or
          status, click a row to open the control drawer.
          {isAdmin(role) && active.assessmentId
            ? " Status, owner, narrative, and assessor notes save into the active assessment."
            : isAdmin(role)
            ? " Set an active assessment to enable persistent edits."
            : ""}
        </p>
      </header>

      <ControlTable
        controls={controls}
        defaultFamily={family}
        canEdit={isAdmin(role) && Boolean(active.assessmentId)}
        assessmentId={active.assessmentId}
        evidence={evidence}
        poams={poams}
      />
    </div>
  );
}
