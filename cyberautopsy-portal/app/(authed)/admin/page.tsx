import { Users, Building2, Plug, KeyRound, Bell, type LucideIcon } from "lucide-react";

export const metadata = { title: "Admin · CyberAutopsy Portal" };

const ROLES = [
  { role: "Partner / Compliance Surgeon", count: 4, perms: "Full access · sign packets" },
  { role: "Contributor (Client IT)",      count: 7, perms: "Edit assigned controls + evidence" },
  { role: "Executive viewer",             count: 3, perms: "Dashboard + brief only" },
  { role: "Assessor (C3PAO)",             count: 2, perms: "Read-only · view evidence + post notes" }
];

const INTEGRATIONS = [
  { name: "Active Directory / Entra ID",  status: "Connected", note: "User & group sync, MFA evidence" },
  { name: "Microsoft Defender / CrowdStrike", status: "Connected", note: "AV policy + update logs" },
  { name: "Splunk",                       status: "Connected", note: "Audit log evidence" },
  { name: "Tenable",                      status: "Connected", note: "Vulnerability scan reports" },
  { name: "DoD SPRS",                     status: "Configured", note: "Score submission integration" },
  { name: "DIBNet",                       status: "Configured", note: "Incident reporting pipeline" }
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-gold-300">ADMIN</div>
        <h1 className="mt-2 font-serif text-4xl tracking-tightest text-bone-50">
          Workspace administration.
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Organization */}
        <Card icon={Building2} title="Organization">
          <dl className="space-y-3 text-sm">
            <Row k="Legal name" v="Northwind Defense Systems, LLC" />
            <Row k="CAGE code" v="1A2B3" />
            <Row k="System boundary" v="CUI Enclave — Primary" />
            <Row k="DoD prime relationships" v="3 active" />
            <Row k="C3PAO of record" v="Veritas Cyber Assessors" />
          </dl>
        </Card>

        {/* Users & roles */}
        <Card icon={Users} title="Users & roles">
          <ul className="divide-y divide-ink-700">
            {ROLES.map((r) => (
              <li key={r.role} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm text-bone-100">{r.role}</div>
                  <div className="font-mono text-[10px] tracking-widest2 text-bone-400">{r.perms}</div>
                </div>
                <span className="font-mono text-xs text-bone-200">{r.count}</span>
              </li>
            ))}
          </ul>
          <button className="mt-4 border border-gold-300/40 bg-gold-300/5 px-3 py-2 text-xs text-gold-100 hover:bg-gold-300 hover:text-ink-950">
            + Invite user
          </button>
        </Card>

        {/* Integrations */}
        <Card icon={Plug} title="Integrations">
          <ul className="divide-y divide-ink-700">
            {INTEGRATIONS.map((i) => (
              <li key={i.name} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm text-bone-100">{i.name}</div>
                  <div className="text-[11px] text-bone-400">{i.note}</div>
                </div>
                <span className="border border-status-met/60 bg-status-metBg px-2 py-0.5 font-mono text-[9px] tracking-widest2 text-status-met">
                  {i.status.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Security */}
        <Card icon={KeyRound} title="Security">
          <dl className="space-y-3 text-sm">
            <Row k="SSO provider" v="Microsoft Entra ID" />
            <Row k="MFA enforcement" v="FIDO2 / hardware key" />
            <Row k="Session timeout" v="15 minutes" />
            <Row k="Data residency" v="US-Gov" />
            <Row k="Encryption" v="FIPS 140-3 validated modules" />
          </dl>
        </Card>

        {/* Notifications */}
        <Card icon={Bell} title="Notifications" wide>
          <p className="text-sm text-bone-200">
            Configurable alerts route to partner, owner, or executive viewer based on event type.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Evidence expiring < 30 days",
              "POA&M due within 14 days",
              "C3PAO request posted",
              "SPRS score drops below 88",
              "Affirmation due in 60 days",
              "Control flipped to Not Implemented"
            ].map((t) => (
              <label
                key={t}
                className="flex items-center justify-between border border-ink-700 bg-ink-950 p-3"
              >
                <span className="text-xs text-bone-200">{t}</span>
                <span className="relative inline-block h-5 w-9 rounded-full bg-status-met/30">
                  <span className="absolute left-4 top-0.5 inline-block h-4 w-4 rounded-full bg-status-met" aria-hidden />
                </span>
              </label>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
  wide
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`border border-ink-700 bg-ink-900 p-6 ${wide ? "lg:col-span-2" : ""}`}>
      <header className="flex items-center gap-2 border-b border-ink-700 pb-3">
        <Icon size={14} className="text-gold-300" />
        <h2 className="font-serif text-lg text-bone-50">{title}</h2>
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-bone-400">{k}</dt>
      <dd className="text-bone-100">{v}</dd>
    </div>
  );
}
