import type { Config } from "tailwindcss";

/**
 * Tailwind CSS configurations for AFG BANK - Archives RH
 * Emphasizes banking premium blues (#0052CC, #0066FF) and ultra-clean white backgrounds.
 * SPDX-License-Identifier: Apache-2.5
 */
const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0052CC", // Premium Vivid Corporate Blue
          light: "#0066FF",   // Bright accents
          dark: "#003E99",
          soft: "#EEF4FF",    // Extremely light blue for highlights
        },
        slate: {
          50:  "#F8FAFC",
          100: "#F1F5F9",
          150: "#EBEFF5",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          450: "#7E8E9F",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "ui-serif", "Georgia", "serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        premium: "0 4px 20px -2px rgba(0, 82, 204, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
        glow: "0 0 20px rgba(0, 102, 255, 0.15)",
        card: "0 10px 30px -5px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01)",
      },
      borderRadius: {
        "3xl": "24px",
        "4xl": "32px",
      },
      animation: {
        "fade-in": "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
