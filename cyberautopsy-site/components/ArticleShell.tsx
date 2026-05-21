import Link from "next/link";

export type Section = { id: string; title: string };
export type Related = { href: string; tag: string; title: string };

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  byline: string;
  date: string;
  readingTime: string;
  toc: Section[];
  related: Related[];
  children: React.ReactNode;
};

export function ArticleShell({
  eyebrow,
  title,
  subtitle,
  byline,
  date,
  readingTime,
  toc,
  related,
  children
}: Props) {
  return (
    <>
      {/* HERO */}
      <section className="relative border-b border-ink-700/60 bg-ink-950">
        <div className="absolute inset-0 -z-10 bg-blueprint bg-blueprint-grid opacity-20" />
        <div className="mx-auto max-w-4xl px-6 pt-24 pb-12 lg:px-10 lg:pt-28">
          <span className="classified-stamp">{eyebrow}</span>
          <h1 className="mt-8 font-serif text-4xl leading-[1.05] tracking-tightest sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && <p className="mt-6 text-lg text-bone-300">{subtitle}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] tracking-widest2 text-bone-400">
            <span>BY {byline}</span>
            <span>&middot; {date}</span>
            <span>&middot; {readingTime}</span>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="relative bg-ink-950 py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_240px] lg:px-10">
          <article className="prose-article text-bone-200 leading-relaxed">{children}</article>

          <aside className="hidden lg:block">
            <div className="sticky top-28 border-l border-ink-700 pl-5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-bone-400">
                On this page
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {toc.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-bone-300 hover:text-gold-300">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="border-y border-ink-700/60 bg-ink-900 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <span className="classified-stamp">15-MINUTE TRIAGE</span>
          <h2 className="mt-6 font-serif text-3xl tracking-tightest sm:text-4xl">
            Need this read by a partner?
          </h2>
          <p className="mt-4 text-bone-300 max-w-prose2 mx-auto">
            Bring this article to a Contract Risk Audit and we will tell you, against your CAGE code
            and contract value, exactly where the risk sits.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex bg-gold-300 px-6 py-4 text-sm font-medium text-ink-950 hover:bg-gold-200"
          >
            Book a Contract Risk Audit &rarr;
          </Link>
        </div>
      </section>

      {/* RELATED */}
      <section className="bg-ink-950 py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <span className="classified-stamp">RELATED READING</span>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group block border border-ink-700 bg-ink-900 p-6 transition hover:border-gold-300/60"
              >
                <span className="font-mono text-[10px] tracking-widest2 text-gold-300">{r.tag}</span>
                <h3 className="mt-3 font-serif text-xl text-bone-50 group-hover:text-gold-100">
                  {r.title}
                </h3>
                <span className="mt-4 inline-block text-sm text-bone-400 group-hover:text-gold-300">
                  Read &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
