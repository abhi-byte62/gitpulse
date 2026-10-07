/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F14",
        surface: {
          DEFAULT: "#111820",
          secondary: "#151C24",
          elevated: "#1B232D",
          hover: "#1E2732"
        },
        border: {
          DEFAULT: "#202832",
          subtle: "#19212A",
          active: "#384758"
        },
        text: {
          primary: "#E6EDF3",
          secondary: "#8B949E",
          muted: "#656D76"
        },
        accent: {
          DEFAULT: "#58A6FF",
          hover: "#79B8FF",
          subtle: "rgba(88, 166, 255, 0.12)"
        },
        health: {
          excellent: "#3FB950",
          good: "#58A6FF",
          fair: "#D29922",
          needsAttention: "#F85149"
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Noto Sans",
          "Helvetica",
          "Arial",
          "sans-serif"
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace"
        ]
      }
    },
  },
  plugins: [],
}
