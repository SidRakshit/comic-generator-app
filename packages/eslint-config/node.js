module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "turbo"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json"
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "no-console": "warn",
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error"
  },
  env: {
    node: true,
    es2022: true
  },
  ignorePatterns: [
    "dist/",
    "node_modules/",
    "*.js"
  ]
};
