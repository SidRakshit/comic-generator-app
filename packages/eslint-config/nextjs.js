module.exports = {
  extends: [
    "next/core-web-vitals",
    "turbo"
  ],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "@next/next/no-img-element": "warn",
    "@next/next/no-page-custom-font": "warn",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react-hooks/exhaustive-deps": "warn",
    "jsx-a11y/alt-text": "warn",
    "jsx-a11y/aria-props": "warn",
    "jsx-a11y/aria-proptypes": "warn",
    "jsx-a11y/aria-unsupported-elements": "warn",
    "jsx-a11y/role-has-required-aria-props": "warn",
    "jsx-a11y/role-supports-aria-props": "warn"
  },
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  }
};
