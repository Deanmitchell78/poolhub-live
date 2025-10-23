/** Loosen rules so we can ship. Tighten later file-by-file. */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "eslint:recommended"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: {
    // let us merge quickly; we’ll add real types later
    "@typescript-eslint/no-explicit-any": "off",
    // don’t fail builds for unused _args (e.g., _req)
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^unused", "caughtErrorsIgnorePattern": "^_" }],
    // Next.js ergonomics — show as warnings, not errors
    "@next/next/no-html-link-for-pages": "warn",
    "@next/next/no-img-element": "warn",
    "react/no-unescaped-entities": "warn",
  },
};
