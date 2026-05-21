import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { professionalServiceSchema } from "@/lib/schema";
import { SITE } from "@/lib/utils";

// Free, license-friendly fallbacks for Söhne + Tiempos Headline.
// When the licensed faces are acquired, swap these for `localFont` imports.
const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600"]
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600"]
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  title: {
    default: "CyberAutopsy — CMMC Level 2 Certification. Guaranteed.",
    template: "%s — CyberAutopsy"
  },
  description:
    "An RPO partnered with C3PAOs. We take DoD primes and subcontractors from gap to SPRS-submitted in 90 days and certified within the audit window — or we don't stop.",
  keywords: [
    "CMMC Level 2",
    "CMMC certification",
    "NIST 800-171",
    "DFARS 7012",
    "DFARS 7019",
    "DFARS 7020",
    "DFARS 7021",
    "SPRS score",
    "C3PAO",
    "RPO",
    "DoD contractor compliance"
  ],
  authors: [{ name: "CyberAutopsy" }],
  openGraph: {
    type: "website",
    title: "CyberAutopsy — CMMC Level 2 Certification. Guaranteed.",
    description:
      "For contractors who can't afford to lose DoD work. Gap to SPRS submission in 90 days. Certified or we don't stop.",
    url: SITE.domain,
    siteName: SITE.name,
    images: [{ url: "/og.jpg", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberAutopsy — CMMC Level 2 Certification. Guaranteed.",
    description:
      "Former DoD assessors. White-glove compliance for primes and subcontractors with CUI."
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`bg-ink-950 text-bone-50 ${sans.variable} ${serif.variable} ${mono.variable}`}
    >
      <body className="min-h-screen antialiased selection:bg-gold-300 selection:text-ink-950">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-gold-300 focus:text-ink-950 focus:px-3 focus:py-2 focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <Navigation />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
