/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// We are in the client build, so we exclude these Node.js modules
			config.resolve.fallback = {
				fs: false,
				net: false,
				tls: false,
				http2: false,
				dns: false
			};
		}

		return config;
	}
};

export default nextConfig;
