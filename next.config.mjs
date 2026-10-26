import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    memoryBasedWorkersCount: true,
    cpus: 1,
    workerThreads: false,
  },
  async rewrites() {
    return {
      beforeFiles: [
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
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;
