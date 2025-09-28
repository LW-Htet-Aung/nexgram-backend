// eslint.config.js
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended, // ESLint recommended rules
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Node/Express best practices
      "no-console": "off", // allow console logs in backend
      "no-unused-vars": ["warn", { argsIgnorePattern: "next" }], // ignore unused "next" in middleware
      "callback-return": "warn",
      "handle-callback-err": "warn",

      // General best practices
      "prefer-const": "error",
      eqeqeq: ["error", "always"],

      // Styling (can adjust later or add Prettier)
      quotes: ["error", "double", { avoidEscape: true }],
      semi: ["error", "always"],
      indent: ["error", 2],
    },
  },
];
