import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

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
        royal: "#0042F6",
        "royal-medium": "#4E79EE",
        "royal-light": "#ABC0F7",
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
      transitionTimingFunction: {
        "ease-out-quad": "cubic-bezier(.25, .46, .45, .94)",
      },
      textShadow: {
        sm: "0 0 2px var(--tw-shadow-color)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "blur-fade-in": {
          "0%": {
            filter: "blur(8px)",
            opacity: "0",
          },
          "100%": {
            filter: "blur(0px)",
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out-quad",
        "accordion-up": "accordion-up 0.2s ease-out-quad",
        "blur-fade-in": "blur-fade-in 1.2s ease forwards",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") },
      );
    }),
  ],
};
export default config;
