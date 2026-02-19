import coreWebVitalsConfig from "eslint-config-next/core-web-vitals";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  // Next.js native flat config: base rules + TypeScript + core web vitals
  ...coreWebVitalsConfig,

  // Prettier: disables conflicting rules then enforces formatting
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      // Off because unplugin-icons auto-imports icons as globals
      "no-undef": "off",
      "react/jsx-no-undef": "off",
      // Downgraded to warn: these new react-hooks@7 rules flag intentional patterns —
      // useEffect(() => setState(true), []) for SSR mount detection, and direct
      // Three.js uniform mutations which is the correct R3F pattern.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
    languageOptions: {
      globals: {
        // Auto-imported icon globals (replaces .eslintrc-auto-import.json)
        IconBasilTwitterOutline: "readonly",
        IconBiSubstack: "readonly",
        IconFeGithub: "readonly",
        IconHeroiconsCalendar: "readonly",
        IconHeroiconsEnvelope: "readonly",
        IconHeroiconsRightArrow: "readonly",
        IconHeroiconsArrowRight: "readonly",
        IconHeroiconsArrowLeft: "readonly",
        IconHeroiconsArrowDown: "readonly",
        IconHeroiconsXMark: "readonly",
        IconHeroiconsPlay20Solid: "readonly",
        IconHeroiconsPlay: "readonly",
      },
    },
  },
];
