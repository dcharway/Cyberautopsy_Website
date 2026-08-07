import Link from "next/link";
import {
  ShieldCheck,
  Cloud,
  Wrench,
  Cpu,
  Compass,
  GraduationCap,
  type LucideIcon
} from "lucide-react";

export const metadata = {
  title: "Services — Cybersecurity, GRC, Cloud, AI, and Workforce",
  description:
    "Six practice areas: Cybersecurity & GRC, IT & Cloud, Custom GRC & Risk Engineering, Cloud & AI, Mission Support, and Workforce Development. Delivered by senior practitioners."
};

type Practice = {
  id: string;
  code: string;
  icon: LucideIcon;
  name: string;
  headline: string;
  body: string;
  services: string[];
};

const practices: Practice[] = [
  {
    id: "cyber-grc",
    code: "01",
    icon: ShieldCheck,
    name: "Cybersecurity and GRC Services",
    headline: "Identify, manage, and reduce cybersecurity risk with a governance program that stays credible under audit.",
    body:
      "We help organizations build cybersecurity and governance programs that support compliance, mission objectives, and business growth — grounded in risk analysis rather than a checklist. Framework alignment (NIST, CMMC, FedRAMP, FISMA, ISO 27001, SOC 2, HIPAA) follows the risk assessment, not the other way around.",
    services: [
      "Cybersecurity program development and maturity assessments",
      "NIST SP 800-53 and NIST SP 800-171 compliance support",
      "CMMC readiness across all levels (see the CMMC Support page for detail)",
      "FedRAMP and FISMA authorization support",
      "ISO 27001, SOC 2, and HIPAA program stand-up",
      "Governance, Risk, and Compliance (GRC) program implementation",
      "Security control assessments and authorization support",
      "System Security Plans, POA&Ms, and security documentation",
      "Cybersecurity risk assessments and quantitative risk modeling",
      "Third-party, supply chain, and vendor risk management",
      "Policy, procedure, and security control development",
      "Continuous monitoring and compliance reporting",
      "Incident response planning and cybersecurity resilience",
      "Privacy, data protection, and information security governance",
      "Internal controls, fraud prevention, waste reduction, and abuse detection"
    ]
  },
  {
    id: "mission-support",
    code: "02",
    icon: Compass,
    name: "Mission and Organizational Support",
    headline: "Improve operational effectiveness through strategic planning, financial management, and risk-informed governance.",
    body:
      "Driven by an understanding of agency missions and organizational priorities, we improve operational effectiveness through strategic planning, process optimization, financial management, and change leadership. Every engagement is scoped to a measurable outcome for the mission owner.",
    services: [
      "Grant management and oversight",
      "Change management and organizational development",
      "Planning, Programming, Budgeting, and Execution (PPBE) support",
      "Financial modeling, reporting, and automation",
      "Fiscal management and internal controls",
      "Fraud, Waste, and Abuse detection",
      "Business process improvement and optimization",
      "Strategic planning and performance management",
      "Program management and operational analysis",
      "Risk-informed decision-making and governance support"
    ]
  },
  {
    id: "it-cloud",
    code: "03",
    icon: Cloud,
    name: "Information Technology and Cloud Services",
    headline: "Modernize legacy environments and create secure, scalable technology systems that hold up under audit.",
    body:
      "We apply emerging technologies and proven engineering practices to modernize legacy environments, improve system performance, and build secure technology solutions. Security is engineered in from the reference architecture — not appended after go-live.",
    services: [
      "Data modernization and digital transformation",
      "Cloud security architecture and migration support",
      "Secure Software Development Lifecycle implementation",
      "Zero Trust architecture and identity governance",
      "Health information technology systems",
      "System integration, testing, and validation",
      "Data engineering, analytics, and data science",
      "Application and infrastructure modernization",
      "API development and secure system interoperability",
      "Technology governance and architecture",
      "SaaS security and control implementation",
      "Cloud security assessments and configuration reviews",
      "Automation of compliance, security, and business processes"
    ]
  },
  {
    id: "grc-engineering",
    code: "04",
    icon: Wrench,
    name: "Custom GRC and Risk Engineering",
    headline: "Every organization has unique risks. We engineer customized GRC platforms that turn complex compliance data into actionable insight.",
    body:
      "For organizations whose risk profile, regulatory footprint, or scale outgrows off-the-shelf GRC tooling, we design and build custom platforms — from control libraries and evidence workflows to executive dashboards and integrations with cloud, identity, and ticketing systems.",
    services: [
      "Custom GRC platform design and development",
      "Cybersecurity risk modeling and quantitative analysis",
      "Automated control tracking and assessment workflows",
      "Compliance dashboards and executive reporting",
      "Risk registers, control libraries, and evidence management",
      "Automated POA&M and remediation tracking",
      "Security assessment and authorization workflow automation",
      "Integration with cloud, identity, ticketing, and enterprise systems",
      "Tailored governance frameworks for federal, commercial, and regulated environments"
    ]
  },
  {
    id: "ai-emerging",
    code: "05",
    icon: Cpu,
    name: "Cloud, AI, and Emerging Technology Solutions",
    headline: "Adopt AI and cloud responsibly with the governance, privacy, and security controls built in from day one.",
    body:
      "We help organizations adopt artificial intelligence and cloud solutions responsibly, securely, and in alignment with their operational goals — including the governance, privacy, and security controls that regulators are increasingly asking about.",
    services: [
      "Custom cloud solution architecture",
      "Secure AI and machine learning integration",
      "Custom AI assistants and chatbot development",
      "AI governance, risk management, and responsible-use frameworks",
      "Data privacy and protection for AI-enabled systems",
      "Workflow automation and intelligent process optimization",
      "AI-enhanced cybersecurity monitoring and reporting",
      "Custom applications and technology prototypes",
      "Integration of AI, analytics, and enterprise data platforms"
    ]
  },
  {
    id: "workforce",
    code: "06",
    icon: GraduationCap,
    name: "Workforce Development and Cybersecurity Training",
    headline: "Build the people, processes, and knowledge required to sustain secure and high-performing operations.",
    body:
      "Tools and frameworks fail without trained operators. We build the training programs, curricula, and exercises that turn cybersecurity requirements into practiced organizational behavior.",
    services: [
      "Cybersecurity awareness and role-based training",
      "Technical training and professional development programs",
      "Instructional design and curriculum development",
      "Security, privacy, and compliance training",
      "Knowledge management and organizational learning",
      "Distance learning and eLearning solutions",
      "Cybersecurity workforce development",
      "STEM engagement and education",
      "Tabletop exercises and incident response training",
      "Training for NIST, FedRAMP, CMMC, and cloud security requirements"
    ]
  }
];

export default function Services() {
  return (
    <>
      {/* HERO */}
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:px-10 lg:pt-32 lg:pb-28">
          <span className="classified-stamp">SERVICES</span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.04] tracking-tightest sm:text-6xl lg:text-7xl max-w-5xl">
            Six practices.{" "}
            <span className="gold-text">One integrated portfolio.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-bone-200">
            Cybersecurity, GRC, cloud, AI, mission support, and workforce development. Each practice
            stands alone; the practices compose when an engagement calls for it. Every service is
            scoped to a measurable outcome, aligned to the framework your regulators and customers
            expect, and staffed with senior practitioners.
          </p>

          <nav
            aria-label="Practice areas"
            className="mt-10 flex flex-wrap gap-2 border-t border-ink-700 pt-6"
          >
            {practices.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="inline-flex items-center gap-2 border border-ink-700 bg-ink-900 px-3 py-1.5 font-mono text-[11px] tracking-widest2 text-bone-300 hover:border-gold-300/60 hover:text-gold-200"
              >
                <span className="text-gold-300">{p.code}</span>
                {p.name}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* PRACTICES */}
      <section className="bg-ink-950 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-8">
          {practices.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.id}
                id={p.id}
                className="scroll-mt-24 grid gap-10 border border-ink-700 bg-ink-900 p-8 lg:grid-cols-[220px_1fr_360px] lg:p-12"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center border border-gold-300/50 bg-gold-300/5 text-gold-300">
                      <Icon size={18} />
                    </span>
                    <div className="font-mono text-[11px] tracking-widest2 text-gold-300">
                      PRACTICE {p.code}
                    </div>
                  </div>
                  <h2 className="mt-4 font-serif text-3xl tracking-tightest text-bone-50">
                    {p.name}
                  </h2>
                </div>

                <div>
                  <h3 className="font-serif text-xl text-bone-50 lg:text-2xl">{p.headline}</h3>
                  <p className="mt-4 text-bone-200 max-w-prose2">{p.body}</p>
                  <Link
                    href="/contact"
                    className="mt-6 inline-flex items-center gap-2 border border-gold-300/40 bg-gold-300/5 px-4 py-2.5 text-sm text-gold-100 hover:bg-gold-300 hover:text-ink-950"
                  >
                    Discuss a {p.name.split(" ")[0].toLowerCase()} engagement &rarr;
                  </Link>
                </div>

                <div className="border-t border-ink-700 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
                    Services include
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-bone-200">
                    {p.services.map((s) => (
                      <li key={s} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-2 inline-block h-1.5 w-1.5 rotate-45 bg-gold-300 shrink-0"
                        />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* OUR APPROACH */}
      <section className="border-y border-ink-700/60 bg-ink-900 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <span className="classified-stamp">OUR APPROACH</span>
          <h2 className="mt-8 font-serif text-4xl tracking-tightest sm:text-5xl">
            Practical, measurable,{" "}
            <span className="gold-text">built for long-term success.</span>
          </h2>
          <p className="mt-6 text-bone-200 max-w-prose2 mx-auto">
            We combine cybersecurity expertise, technology innovation, and mission-focused
            consulting to deliver solutions that are practical, measurable, and built to last.
            Whether you need to improve compliance, modernize your cloud environment, engineer a
            custom GRC platform, or responsibly integrate AI, we tailor the service to your
            organization&rsquo;s risk profile and mission.
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center gap-2 bg-gold-300 px-6 py-4 text-sm font-medium text-ink-950 hover:bg-gold-200"
          >
            Request Consultation &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
