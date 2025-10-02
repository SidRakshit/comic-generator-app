import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  { 
    ignores: [
      "dist/", 
      "node_modules/", 
      "*.js", 
      "*.mjs",
      "src/generated/**/*",
      "**/generated/**/*"
    ] 
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "no-unused-vars": "off", // Turn off base rule as it can conflict with @typescript-eslint version
      "@typescript-eslint/no-explicit-any": "off", // Allow any types in backend
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off", // Allow non-null assertions in backend
      "no-console": "off", // Allow console statements in backend
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error"
    },
  },
];
