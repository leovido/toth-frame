/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	env: {
		NEYNAR_CLIENT_ID: process.env.NEYNAR_CLIENT_ID
	},
	images: {
		remotePatterns: [
			{
				hostname: "*",
				protocol: "http"
			},
			{
				hostname: "*",
				protocol: "https"
			}
		]
	}
};

export default nextConfig;
