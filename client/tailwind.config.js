/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090C",
        surface: {
          DEFAULT: "#0E1117",
          subtle: "#12161F",
          secondary: "#161B26",
          elevated: "#1B2230",
          hover: "#222B3D"
        },
        border: {
          DEFAULT: "#1E2636",
          subtle: "#141A26",
          active: "#334155",
          highlight: "rgba(255, 255, 255, 0.12)"
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B"
        },
        brand: {
          DEFAULT: "#00F59B", // Electric Mint / Ramp accent
          lime: "#CCFF00",
          cyan: "#38BDF8",
          hover: "#34D399",
          subtle: "rgba(0, 245, 155, 0.08)",
          glow: "rgba(0, 245, 155, 0.25)"
        },
        accent: {
          DEFAULT: "#38BDF8",
          hover: "#60A5FA",
          subtle: "rgba(56, 189, 248, 0.1)"
        },
        health: {
          excellent: "#00F59B",
          good: "#38BDF8",
          fair: "#FBBF24",
          needsAttention: "#F87171"
        }
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace"
        ]
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        normal: "0em",
        wide: "0.04em"
      }
    },
  },
  plugins: [],
}
