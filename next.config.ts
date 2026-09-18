import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // LiteAPI (Nuitee Connect) hotel photos.
        protocol: "https",
        hostname: "static.cupid.travel",
      },
    ],
  },
};

export default nextConfig;
