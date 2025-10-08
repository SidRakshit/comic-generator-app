// next.config.js Example
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
				hostname: "comic-gen-app-images-prod-us-east-1.s3.us-east-1.amazonaws.com",
			},
			// Add any other external domains you use
		],
	},
};
module.exports = nextConfig;
