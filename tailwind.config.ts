import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          DEFAULT: "#1e3a8a",
          dark: "#1e3a8a",
          light: "#2563eb",
        },
        soft: {
          red: "#dc2626",
          "red-hover": "#b91c1c",
        },
      },
      animation: {
        "scale-in": "scale-in 0.2s ease-out",
      },
      keyframes: {
        "scale-in": {
          "0%": { transform: "scale(0.98)" },
          "100%": { transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
