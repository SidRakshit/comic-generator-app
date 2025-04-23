// next.config.js Example
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
      // Add any other external domains you use
    ],
  },
};
module.exports = nextConfig;