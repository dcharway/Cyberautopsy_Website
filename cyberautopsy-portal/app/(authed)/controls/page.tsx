import { CONTROLS } from "@/data/controls110";
import { ControlTable } from "@/components/controls/ControlTable";
import type { FamilyCode } from "@/lib/types";

export const metadata = { title: "Controls · CyberAutopsy Portal" };

// Server component reads ?family= from the URL and forwards to the client table.
export default function ControlsPage({
  searchParams
}: {
  searchParams: { family?: string };
}) {
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
        </p>
      </header>

      <ControlTable controls={CONTROLS} defaultFamily={family} />
    </div>
  );
}
