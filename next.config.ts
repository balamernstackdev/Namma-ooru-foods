import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true,
    qualities: [75, 90],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
  },
  async rewrites() {
    return [
      {
        source: '/vendor',
        destination: '/seller',
      },
      {
        source: '/vendor/',
        destination: '/seller',
      },
      {
        source: '/vendor/:path*',
        destination: '/seller/:path*',
      },
    ];
  },
};

export default nextConfig;

