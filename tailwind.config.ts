import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'DM Mono'", "Menlo", "monospace"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        display: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          950: "#010912",
          900: "#020B18",
          800: "#04152B",
          700: "#0A1F3C",
          600: "#102B50",
          500: "#1A3A65",
        },
        blue: {
          google: "#1A73E8",
          bright: "#4D94FF",
          muted: "#1557B0",
        },
        slate: {
          dim: "#3D5066",
          mid: "#5E7A94",
          light: "#8FA8C0",
          pale: "#B8CEDF",
        },
        surface: {
          0: "#010912",
          1: "#04152B",
          2: "#08213E",
          3: "#0D2D51",
        },
        border: {
          dim: "#0F2840",
          mid: "#1A3B5C",
          bright: "#274E75",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "scan": "scan 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
