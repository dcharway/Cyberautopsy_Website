import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ORG = {
  name: "Northwind Defense Systems",
  cage: "1A2B3",
  systemBoundary: "CUI Enclave — Primary",
  activeAssessment: "CAP v2.0 — Phase 2 (Conformity)",
  affirmationDue: "2026-08-12",
  lastAffirmation: "2025-08-12",
  c3pao: "Veritas Cyber Assessors"
};
