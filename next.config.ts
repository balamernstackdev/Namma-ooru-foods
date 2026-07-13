import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 'export' produces a static HTML/CSS/JS output
  // output: 'export', // Removed to make Next.js fully dynamic for Hostinger Node.js
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
  },
};

export default nextConfig;

