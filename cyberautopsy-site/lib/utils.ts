import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SITE = {
  name: "CyberAutopsy",
  domain: "https://cyberautopsy.com",
  tagline: "CMMC Accreditation. Guaranteed.",
  phone: "+1 (202) 555-0117",
  email: "intake@cyberautopsy.com",
  calendly: "https://calendly.com/cyberautopsy/contract-risk-audit"
};
