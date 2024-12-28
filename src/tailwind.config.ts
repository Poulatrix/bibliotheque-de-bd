import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        library: {
          background: "#FAF7F2",
          paper: "#FFFFFF",
          accent: "#FF9F1C",
          text: "#2D3748",
          muted: "#718096",
        },
      },
      fontFamily: {
        merriweather: ["Merriweather", "serif"],
      },
      animation: {
        "card-hover": "card-hover 0.3s ease-in-out forwards",
      },
      keyframes: {
        "card-hover": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;