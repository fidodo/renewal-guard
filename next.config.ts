import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://renewal-guard.onrender.com"; // ← Your Render URL

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
