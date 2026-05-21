import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0A0B",
          900: "#0F0F11",
          800: "#16161A",
          700: "#1F1F24",
          600: "#2A2A30"
        },
        bone: {
          50: "#FAFAFA",
          100: "#F4F4F2",
          200: "#E8E8E4",
          300: "#C9C9C2",
          400: "#8E8E86"
        },
        gold: {
          50: "#FBF6E5",
          100: "#F2E6B5",
          200: "#E5CE7A",
          300: "#D4AF37",
          400: "#B8932A",
          500: "#8C6E1F"
        },
        clinical: {
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7"
        },
        signal: {
          red: "#B91C1C",
          amber: "#B45309",
          green: "#15803D"
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
      maxWidth: {
        prose2: "68ch"
      },
      boxShadow: {
        gilt: "0 0 0 1px rgba(212,175,55,0.18), 0 24px 60px -28px rgba(212,175,55,0.35)"
      },
      backgroundImage: {
        "gold-foil": "linear-gradient(135deg, #D4AF37 0%, #F2E6B5 35%, #8C6E1F 70%, #D4AF37 100%)",
        "blueprint": "linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)"
      },
      backgroundSize: {
        "blueprint-grid": "32px 32px"
      },
      animation: {
        "shimmer": "shimmer 6s ease-in-out infinite",
        "pulse-slow": "pulseSlow 4s ease-in-out infinite"
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        pulseSlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" }
        }
      }
    }
  },
  plugins: []
};

export default config;
