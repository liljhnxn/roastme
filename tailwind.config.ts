import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#0b0d11",
          900: "#11141a",
          850: "#161b24",
          800: "#1c222e",
          700: "#272f3e",
          600: "#364154",
        },
        accent: {
          purple: {
            DEFAULT: "#8b72db",
            hover: "#9f89e5",
            light: "#b4a3ee",
            dim: "rgba(139, 114, 219, 0.15)",
          },
          green: {
            DEFAULT: "#38b284",
            hover: "#4ec194",
            light: "#66d4a8",
            dim: "rgba(56, 178, 132, 0.15)",
          },
        },
        soft: {
          muted: "#8590a6",
          light: "#d5dbe6",
          heading: "#f0f3f8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        "card-hover": "0 8px 30px -4px rgba(0, 0, 0, 0.65)",
        glow: "0 0 25px -5px rgba(139, 114, 219, 0.25)",
        "glow-green": "0 0 25px -5px rgba(56, 178, 132, 0.25)",
      },
      borderColor: {
        subtle: "rgba(255, 255, 255, 0.08)",
        "subtle-hover": "rgba(255, 255, 255, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;

