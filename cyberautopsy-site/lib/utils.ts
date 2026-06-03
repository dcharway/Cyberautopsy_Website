import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SITE = {
  name: "CyberAutopsy",
  domain: "https://cyberautopsy.com",
  tagline: "CMMC Accreditation. Guaranteed.",
  phone: "+1 (443) 244-2977",
  email: "intake@cyberautopsy.com",
  // Calendly URL is configured via NEXT_PUBLIC_CALENDLY_URL env var on the VPS.
  // When unset, the contact page shows a graceful "booking pending setup" panel.
  calendly: ""
};
