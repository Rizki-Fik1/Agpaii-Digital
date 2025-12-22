/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: "/:path*", // Match all routes
				headers: [
					{
						key: "Cache-Control",
						value: "no-store, no-cache, must-revalidate, proxy-revalidate",
					},
					{ key: "Pragma", value: "no-cache" },
					{ key: "Expires", value: "0" },
				],
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn-agpaiidigital.online",
			},
			{
				protocol: "https",
				hostname: "mitra.agpaiidigital.org",
			},
			{
				protocol: "https",
				hostname: "file.agpaiidigital.org",
			},
			{
				protocol: "https",
				hostname: "via.placeholder.com",
			},
		],
	},
	typescript: {
		ignoreBuildErrors: true,
	},

	webpack: {
		cache: false,
	}
};

export default nextConfig;
