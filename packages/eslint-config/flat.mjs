import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IGNORES = [
  "**/node_modules/**",
  "**/.next/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
];

function createCompat() {
  return new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
  });
}

function withCommonIgnores(configs) {
  return [{ ignores: IGNORES }, ...configs];
}

export function createNextConfig(additionalRules = {}) {
  const compat = createCompat();
  const configs = compat.config({ extends: ["@repo/eslint-config/nextjs"] });
  configs.push({
    rules: {
      "turbo/no-undeclared-env-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      ...additionalRules,
    },
  });
  return withCommonIgnores(configs);
}

export function createReactLibraryConfig(additionalRules = {}) {
  const compat = createCompat();
  const configs = compat.config({ extends: ["@repo/eslint-config/react-library"] });
  configs.push({
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      ...additionalRules,
    },
  });
  return withCommonIgnores(configs);
}

export function createNodeConfig(additionalRules = {}) {
  const compat = createCompat();
  const configs = compat.config({ extends: ["@repo/eslint-config/node"] });
  configs.push({
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      ...additionalRules,
    },
  });
  return withCommonIgnores(configs);
}
