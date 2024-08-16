import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ['"Plus Jakarta Sans"', "Inter", "Helvetica", "sans-serif"],
      serif: ['"Libre Baskerville"', "Times New Roman", "serif"],
      'libre-baskerville': ['"Libre Baskerville"', 'serif'],
      'plus-jakarta-sans': ['"Plus Jakarta Sans"', 'sans-serif'],
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  } 
};
export default config;
