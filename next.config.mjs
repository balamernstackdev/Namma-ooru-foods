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
};

export default nextConfig;
