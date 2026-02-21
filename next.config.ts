import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://staging.frumusetepeloc.ro https://frumusetepeloc.ro",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
