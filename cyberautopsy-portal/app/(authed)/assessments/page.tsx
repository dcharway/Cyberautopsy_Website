import { CAPStepper } from "@/components/assessments/CAPStepper";
import { ORG } from "@/lib/utils";

export const metadata = { title: "Assessments · CyberAutopsy Portal" };

export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">
          ASSESSMENT WORKFLOW · CAP v2.0
        </div>
        <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
          Four phases. <span className="gold-text">One certificate.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bone-300">
          The CMMC Assessment Process is a four-phase engagement with {ORG.c3pao}. Each phase has a
          required artifact set; checklists below track delivery against the C3PAO request queue.
        </p>
      </header>

      <CAPStepper />
    </div>
  );
}
