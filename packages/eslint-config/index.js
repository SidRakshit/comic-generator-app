// Main exports for @repo/eslint-config
module.exports = {
  // Default configuration (Next.js focused)
  extends: ["next/core-web-vitals", "turbo"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
  
  // Export all configurations
  nextjs: require('./nextjs.js'),
  node: require('./node.js'),
  'react-library': require('./react-library.js')
};
