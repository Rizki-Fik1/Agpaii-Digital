/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          {
            key: "Content-Security-Policy",
            value: `
              frame-src
                'self'
                https://www.youtube.com
                https://www.youtube-nocookie.com
                https://app.midtrans.com
                https://simulator.sandbox.midtrans.com
                https://docs.google.com
                https://tripay.co.id;
              child-src
                'self'
                https://www.youtube.com
                https://www.youtube-nocookie.com
                https://app.midtrans.com
                https://simulator.sandbox.midtrans.com
                https://docs.google.com
                https://tripay.co.id;
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn-agpaiidigital.online" },
      { protocol: "https", hostname: "admin.agpaiidigital.org" },
      { protocol: "https", hostname: "file.agpaiidigital.org" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "agpaii.or.id" },
    ],
  },

  // kamu sengaja aktifkan
  typescript: {
    ignoreBuildErrors: true,
  },

  // FIX konflik Next 16
  turbopack: {},

  webpack(config) {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
