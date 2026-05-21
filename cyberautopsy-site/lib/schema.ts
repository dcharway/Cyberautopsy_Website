import { SITE } from "./utils";

export const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE.name,
  url: SITE.domain,
  image: `${SITE.domain}/og.jpg`,
  description:
    "CyberAutopsy is a CMMC RPO partnered with C3PAOs. We take DoD contractors from gap assessment to certified, with an outcome guarantee.",
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: [
    "CMMC Level 2 Readiness",
    "NIST 800-171 Gap Assessment",
    "SSP and POA&M Development",
    "SPRS Score Submission",
    "C3PAO Audit Escort"
  ],
  priceRange: "$$$$",
  address: {
    "@type": "PostalAddress",
    addressCountry: "US",
    addressRegion: "Northern Virginia"
  },
  telephone: SITE.phone,
  email: SITE.email,
  sameAs: [
    "https://www.linkedin.com/company/cyberautopsy"
  ]
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is CMMC Level 2 and who needs it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CMMC Level 2 is the Department of Defense's certification standard for any contractor or subcontractor that handles Controlled Unclassified Information (CUI). It maps to the 110 controls of NIST SP 800-171. Without certification, you cannot bid on or hold contracts that flow down DFARS 252.204-7021."
      }
    },
    {
      "@type": "Question",
      name: "How long does CMMC Level 2 certification take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "From engagement to SPRS-submitted, audit-ready posture, our standard path is 90 to 120 days. Heavily under-implemented environments may require a longer remediation surge. Certification through a C3PAO assessment follows within a 60-90 day window after audit-ready status."
      }
    },
    {
      "@type": "Question",
      name: "What is the difference between an RPO and a C3PAO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An RPO (Registered Provider Organization) prepares contractors for certification. A C3PAO (Certified Third-Party Assessment Organization) performs the certifying assessment. Federal conflict-of-interest rules prohibit one firm from doing both for the same client. CyberAutopsy is an RPO; we partner with accredited C3PAOs to deliver the assessment."
      }
    },
    {
      "@type": "Question",
      name: "What does a POA&M allow under CMMC 2.0?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "CMMC 2.0 permits a Plan of Action and Milestones for a limited subset of lower-weighted controls, provided the contractor achieves a minimum SPRS score (currently 88 of 110) and closes the POA&M within 180 days. High-value controls cannot be on a POA&M at certification."
      }
    },
    {
      "@type": "Question",
      name: "What are DFARS 7012, 7019, 7020, and 7021?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DFARS 252.204-7012 requires safeguarding CUI and incident reporting. 7019 requires a current SPRS score. 7020 grants DoD assessment rights and flow-down to subcontractors. 7021 is the CMMC certification requirement clause. All four flow down to subcontractors handling CUI."
      }
    }
  ]
};
