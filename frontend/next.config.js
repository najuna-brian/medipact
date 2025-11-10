/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Only fail on errors, not warnings
    dirs: ['src/app', 'src/components', 'src/lib', 'src/hooks'],
    // Exclude test files from linting during build
    ignoreDuringBuilds: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Allow importing from adapter directory
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;

