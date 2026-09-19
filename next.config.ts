import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel's image-optimization quota is exhausted on this project, so the
    // optimizer returns 402 and every <Image> renders broken in production.
    // Serving supplier photos straight from their CDN (already thumbnail-sized)
    // sidesteps the quota entirely. Flip this back once the plan allows it.
    unoptimized: true,
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
