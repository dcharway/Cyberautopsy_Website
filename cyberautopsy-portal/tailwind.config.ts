import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand: dark ink + bone + gold (same DNA as marketing site)
        ink: {
          950: "#0A0A0B",
          900: "#0F0F11",
          800: "#16161A",
          700: "#1F1F24",
          600: "#2A2A30",
          500: "#3A3A42"
        },
        bone: {
          50: "#FAFAFA",
          100: "#F4F4F2",
          200: "#E8E8E4",
          300: "#C9C9C2",
          400: "#8E8E86",
          500: "#5C5C57"
        },
        gold: {
          50: "#FBF6E5",
          100: "#F2E6B5",
          200: "#E5CE7A",
          300: "#D4AF37",
          400: "#B8932A",
          500: "#8C6E1F"
        },
        // CMMC status palette (per spec)
        status: {
          met: "#16A34A",
          metBg: "rgba(22,163,74,0.12)",
          partial: "#F59E0B",
          partialBg: "rgba(245,158,11,0.12)",
          failed: "#DC2626",
          failedBg: "rgba(220,38,38,0.12)",
          notStarted: "#6B7280",
          notStartedBg: "rgba(107,114,128,0.10)",
          review: "#2563EB",
          reviewBg: "rgba(37,99,235,0.12)",
          na: "#71717A",
          naBg: "rgba(113,113,122,0.10)"
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      letterSpacing: {
        tightest: "-0.04em",
        widest2: "0.24em"
      },
      boxShadow: {
        gilt: "0 0 0 1px rgba(212,175,55,0.18), 0 24px 60px -28px rgba(212,175,55,0.35)"
      }
    }
  },
  plugins: []
};

export default config;
