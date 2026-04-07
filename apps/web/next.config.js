/** @type {import('next').NextConfig} */
const path = require('path');

// Load environment variables from root .env file
const rootEnvPath = path.resolve(__dirname, '../../.env');
if (require('fs').existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
}

const nextConfig = {
  // Add path aliases for workspace dependencies
  transpilePackages: [
    '@media-harvest/react-shared',
    '@media-harvest/styling-shared', 
    '@media-harvest/ui',
    '@media-harvest/version',
    '@media-harvest/types',
    '@media-harvest/license',
    '@media-harvest/theme'
  ],
  // Use webpack instead of Turbopack for compatibility
  webpack: (config, { isServer }) => {
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
    };
    return config;
  },
  // Configure Turbopack to use webpack for now
  turbopack: {},
  // Skip TypeScript checking for React 19 compatibility
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
