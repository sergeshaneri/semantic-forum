import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow third-party sites to <iframe> embed cards.
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
          {
            // Remove any inherited X-Frame-Options: SAMEORIGIN.
            // The presence of an empty value would still block, so we omit
            // setting it entirely; CSP frame-ancestors takes precedence in modern browsers.
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
