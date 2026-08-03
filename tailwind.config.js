/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mc: {
          bg: "#0a0e0a",
          panel: "#121a12",
          panel2: "#1a241a",
          border: "#233323",
          green: "#4ade80",
          green2: "#22c55e",
          gold: "#fbbf24",
          gold2: "#f59e0b",
          dim: "#8aa88a",
          text: "#d8e8d8",
        },
      },
      fontFamily: {
        minecraft: ['"Press Start 2P"', "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
        slideUp: "slideUp 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
