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
      fontSize: {
        xxs: [
          "10px",
          {
            lineHeight: "0.875rem",
          },
        ],
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "Inter", "Helvetica"],
        serif: ["var(--font-libre-baskerville)"],
        mono: ["var(--font-ibm-plex-mono)"],
      },
      colors: {
        black: "#1f1f1f",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionProperty: {
        spacing: "margin, padding",
        "spacing-and-colors":
          "margin, padding, color, background-color, border-color, text-decoration-color, fill, stroke;",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
};
export default config;
