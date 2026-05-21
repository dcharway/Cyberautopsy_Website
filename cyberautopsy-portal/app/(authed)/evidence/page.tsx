import { CONTROLS, FAMILY_NAMES } from "@/data/controls110";
import { familyPosture } from "@/lib/analytics";
import { Upload, Search, AlertCircle } from "lucide-react";

export const metadata = { title: "Evidence · CyberAutopsy Portal" };

type Sample = {
  id: string;
  controlId: string;
  name: string;
  type: "Config Export" | "Screenshot" | "Policy Doc" | "Log Sample";
  system: string;
  owner: string;
  collected: string;
  expires: string;
  status: "Valid" | "Expiring Soon" | "Expired";
};

const SAMPLE: Sample[] = [
  { id: "EVD-AC-001", controlId: "3.1.1",   name: "AD Group Membership Export",       type: "Config Export", system: "Active Directory", owner: "J. Smith",   collected: "2026-04-10", expires: "2026-10-10", status: "Valid" },
  { id: "EVD-AC-002", controlId: "3.1.1",   name: "MFA Enforcement Policy",           type: "Policy Doc",    system: "Azure AD",         owner: "A. Lee",     collected: "2026-03-15", expires: "—",          status: "Valid" },
  { id: "EVD-AC-012", controlId: "3.1.10",  name: "GPO Screen-Lock Settings",         type: "Config Export", system: "Group Policy",     owner: "J. Smith",   collected: "2026-05-14", expires: "2026-11-14", status: "Valid" },
  { id: "EVD-IA-003", controlId: "3.5.3",   name: "VPN MFA Conditional Access",       type: "Config Export", system: "Azure AD",         owner: "A. Lee",     collected: "2026-05-01", expires: "—",          status: "Valid" },
  { id: "EVD-SC-006", controlId: "3.13.8",  name: "Firewall Rule Export (egress)",    type: "Config Export", system: "Palo Alto",        owner: "T. Kim",     collected: "2026-04-30", expires: "2026-10-30", status: "Valid" },
  { id: "EVD-SI-005", controlId: "3.14.2",  name: "CrowdStrike AV Policy Screenshot", type: "Screenshot",    system: "CrowdStrike",      owner: "T. Kim",     collected: "2026-04-22", expires: "2026-10-22", status: "Expiring Soon" },
  { id: "EVD-AU-004", controlId: "3.3.1",   name: "SIEM Audit Policy + 7d sample",    type: "Log Sample",    system: "Splunk",           owner: "R. Vasquez", collected: "2026-03-01", expires: "2026-05-30", status: "Expiring Soon" },
  { id: "EVD-CM-019", controlId: "3.4.1",   name: "CIS Benchmark scan (10% sample)",  type: "Config Export", system: "Tenable",          owner: "J. Smith",   collected: "2025-08-12", expires: "2026-02-12", status: "Expired" }
];

const STATUS_STYLE: Record<Sample["status"], string> = {
  Valid:           "border-status-met/60 text-status-met",
  "Expiring Soon": "border-status-partial/60 text-status-partial",
  Expired:         "border-status-failed/60 text-status-failed"
};

export default function EvidencePage() {
  const posture = familyPosture(CONTROLS);
  const totalControls = CONTROLS.length;
  const linked = CONTROLS.filter((c) => c.evidenceIds.length > 0).length;
  const coverage = Math.round((linked / totalControls) * 100);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">EVIDENCE REPOSITORY</div>
          <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
            Every artifact, <span className="gold-text">defensible.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-bone-300">
            File-naming enforced ({"{"}ControlID{"}"}_artifact_{"{"}YYYY-MM-DD{"}"}.ext), each item mapped to an
            assessment objective. Expiration-aware so nothing goes stale before audit day.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gold-300 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-gold-200">
          <Upload size={14} /> Upload artifact
        </button>
      </header>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile label="Coverage" value={`${coverage}%`} sub={`${linked} of ${totalControls} controls`} />
        <KpiTile label="Total artifacts" value="92" sub="Across 14 families" />
        <KpiTile label="Expiring < 30 days" value="12" sub="Refresh before C3PAO fieldwork" accent="text-status-partial" />
        <KpiTile label="Expired" value="4" sub="Blocking assessment" accent="text-status-failed" />
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 border border-ink-700 bg-ink-900 px-3 py-2">
        <Search size={14} className="text-bone-400" />
        <input
          placeholder="Search artifacts by control ID, name, owner…"
          className="flex-1 bg-transparent text-sm text-bone-100 placeholder:text-bone-400 focus:outline-none"
        />
      </div>

      {/* Coverage by family */}
      <section className="border border-ink-700 bg-ink-900">
        <header className="border-b border-ink-700 p-4">
          <h2 className="font-serif text-lg text-bone-50">Coverage by family</h2>
        </header>
        <div className="grid gap-px bg-ink-700 sm:grid-cols-2 lg:grid-cols-7">
          {Array.from(posture.entries()).map(([code, p]) => {
            const pct = Math.round((p.impl / p.total) * 100);
            return (
              <div key={code} className="bg-ink-900 p-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] tracking-widest2 text-gold-300">{code}</span>
                  <span className="font-mono text-xs text-bone-100">{pct}%</span>
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-bone-400 line-clamp-1">
                  {FAMILY_NAMES[code]}
                </div>
                <div className="mt-2 h-1 bg-ink-700">
                  <div className="h-full bg-status-met" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Master list */}
      <section className="border border-ink-700 bg-ink-900 overflow-x-auto">
        <header className="border-b border-ink-700 p-4 flex items-center justify-between">
          <h2 className="font-serif text-lg text-bone-50">Master artifact list</h2>
          <span className="font-mono text-[10px] tracking-widest2 text-bone-400">
            {SAMPLE.length} ARTIFACTS · SAMPLE
          </span>
        </header>
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-700 bg-ink-950 text-left">
              <Th>ID</Th>
              <Th>Control</Th>
              <Th>Artifact</Th>
              <Th>Type</Th>
              <Th>System</Th>
              <Th>Owner</Th>
              <Th>Collected</Th>
              <Th>Expires</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE.map((e) => (
              <tr key={e.id} className="border-b border-ink-700/60 hover:bg-ink-800">
                <Td>
                  <span className="font-mono text-xs text-bone-100">{e.id}</span>
                </Td>
                <Td>
                  <span className="font-mono text-xs text-gold-300">{e.controlId}</span>
                </Td>
                <Td>
                  <span className="text-sm text-bone-100">{e.name}</span>
                </Td>
                <Td>
                  <span className="text-xs text-bone-300">{e.type}</span>
                </Td>
                <Td>
                  <span className="text-xs text-bone-300">{e.system}</span>
                </Td>
                <Td>
                  <span className="text-xs text-bone-200">{e.owner}</span>
                </Td>
                <Td>
                  <span className="font-mono text-[11px] text-bone-400">{e.collected}</span>
                </Td>
                <Td>
                  <span className="font-mono text-[11px] text-bone-400">{e.expires}</span>
                </Td>
                <Td>
                  <span className={`border px-2 py-0.5 font-mono text-[9px] tracking-widest2 ${STATUS_STYLE[e.status]}`}>
                    {e.status === "Expired" && <AlertCircle size={9} className="-mt-0.5 inline-block" />} {e.status.toUpperCase()}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function KpiTile({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: string }) {
  return (
    <div className="border border-ink-700 bg-ink-900 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{label}</div>
      <div className={`mt-2 font-serif text-3xl text-bone-50 ${accent ?? ""}`}>{value}</div>
      <div className="mt-1 text-xs text-bone-400">{sub}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-bone-400">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}
