import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${
          process.env.NODE_ENV === "development"
            ? "http://localhost:5500/api/v1/:path*"
            : "https://renewal-guard.onrender.com/api/v1/:path*"
        }`,
      },
    ];
  },
};

export default nextConfig;
