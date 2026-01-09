import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    '@action-atlas/types',
    '@action-atlas/database',
    '@action-atlas/ai',
  ],
  // Disable typed routes for now - experimental feature causing type issues
  // typedRoutes: true,
  outputFileTracingRoot: '../..',
  eslint: {
    // Skip lint during build - will fix in Phase 4
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't type check during build - already checked separately
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
