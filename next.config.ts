import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Allow any HTTPS hostname — needed because post media_urls and
        // avatar_url fields are user-supplied and can come from any domain.
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;