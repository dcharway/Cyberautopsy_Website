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
    default: "CyberAutopsy — Cybersecurity, Risk, and Technology Services",
    template: "%s — CyberAutopsy"
  },
  description:
    "Risk-based cybersecurity, GRC, cloud, AI, and workforce services for federal agencies, defense contractors, regulated organizations, and commercial businesses. CMMC support is one part of a broader portfolio.",
  keywords: [
    "Cybersecurity consulting",
    "GRC",
    "Governance Risk and Compliance",
    "NIST 800-53",
    "NIST 800-171",
    "CMMC",
    "FedRAMP",
    "FISMA",
    "Zero Trust",
    "ISO 27001",
    "SOC 2",
    "HIPAA",
    "Cloud security",
    "Third-party risk",
    "AI governance",
    "Cybersecurity workforce development"
  ],
  authors: [{ name: "CyberAutopsy" }],
  openGraph: {
    type: "website",
    title: "CyberAutopsy — Cybersecurity, Risk, and Technology Services",
    description:
      "Cybersecurity, GRC, cloud, AI, and workforce services for federal, defense, regulated, and commercial organizations. Risk-based, not checklist-driven.",
    url: SITE.domain,
    siteName: SITE.name,
    images: [{ url: "/og.jpg", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberAutopsy — Cybersecurity, Risk, and Technology Services",
    description:
      "Practical, risk-based cybersecurity and GRC services. NIST, CMMC, FedRAMP, Zero Trust, cloud security, AI governance, workforce development."
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
