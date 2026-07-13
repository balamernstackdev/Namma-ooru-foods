import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Removed to make Next.js fully dynamic for Hostinger Node.js
  output: 'standalone',
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

