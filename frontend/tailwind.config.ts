import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0fdf6",
          100: "#dcfce9",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        navy: {
          900: "#0a0f1e",
          800: "#0d1526",
          700: "#111d35",
          600: "#162040",
        },
        glass: {
          DEFAULT: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.12)",
          hover:  "rgba(255,255,255,0.10)",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        glow:  "0 0 24px rgba(16,185,129,0.25)",
      },
      fontFamily: {
        pashto: ["'Noto Nastaliq Urdu'", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
