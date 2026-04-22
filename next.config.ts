import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://renewal-guard.onrender.com";

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
  images: {
    domains: ["localhost", "renewal-guard.onrender.com"],
  },

  reactStrictMode: true,
};

export default nextConfig;
