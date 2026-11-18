import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        nepse: {
          green: "#00C853",
          red: "#FF3D00",
          blue: "#2979FF",
          gold: "#FFD700",
          dark: "#0F172A",
          darker: "#0B0F19",
          card: "#1E293B",
          border: "#334155"
        }
      },
    },
  },
  plugins: [],
};
export default config;
