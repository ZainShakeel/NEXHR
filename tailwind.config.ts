import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // NexHR Brand
        brand: {
          950: "#022c1a",
          900: "#064E3B",
          800: "#065F46",
          700: "#047857",
          600: "#059669",
          500: "#16A34A",
          400: "#22c55e",
          100: "#D1FAE5",
          50:  "#ECFDF5",
        },
        // Surfaces
        background: "#F7F9F8",
        surface:    "#FFFFFF",
        "surface-2": "#F0F4F2",
        // Text
        "text-primary":   "#17211C",
        "text-secondary": "#4A5E55",
        "text-muted":     "#8AA398",
        // Border
        border:        "#E5EAE7",
        "border-strong": "#C8D5CF",
        // Sidebar
        sidebar: {
          DEFAULT: "#064E3B",
          foreground: "#A7C5B9",
          active: "#FFFFFF",
        },
        // Semantic
        success: "#16A34A",
        warning: "#D97706",
        danger:  "#DC2626",
        info:    "#2563EB",
      },
      fontFamily: {
        sans:    ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        body:    ["DM Sans", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm:  "6px",
        DEFAULT: "10px",
        lg:  "16px",
        xl:  "24px",
        "2xl": "32px",
      },
      boxShadow: {
        sm:   "0 1px 3px rgba(6,78,59,0.06), 0 1px 2px rgba(6,78,59,0.04)",
        DEFAULT: "0 4px 12px rgba(6,78,59,0.08), 0 2px 4px rgba(6,78,59,0.04)",
        lg:   "0 12px 32px rgba(6,78,59,0.12), 0 4px 8px rgba(6,78,59,0.06)",
      },
      fontSize: {
        xs:   ["0.6875rem", { lineHeight: "1rem" }],
        sm:   ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.5rem" }],
        md:   ["1.0625rem", { lineHeight: "1.625rem" }],
        lg:   ["1.25rem",   { lineHeight: "1.75rem" }],
        xl:   ["1.5rem",    { lineHeight: "2rem" }],
        "2xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "3xl": ["2.5rem",   { lineHeight: "2.75rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
