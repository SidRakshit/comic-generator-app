/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "comic-gen-image-prod-us-east-1.s3.us-east-1.amazonaws.com",
      },
    ],
  },
};

module.exports = nextConfig;
