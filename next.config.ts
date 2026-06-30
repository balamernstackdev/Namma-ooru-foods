import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Removed to support ISR/SSR and prevent 404s for dynamically added routes
  trailingSlash: true,
  images: {
    unoptimized: true,
    qualities: [75, 90],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

