/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip static generation for dashboard routes
  env: {
    // Pass environment variables to the client
    // Force NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD to be true during build
    NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD: process.env.NODE_ENV === 'production' ? 'true' : (process.env.NEXT_PUBLIC_SKIP_AUTH_DURING_BUILD || 'false'),
    NEXT_PUBLIC_STATIC_EXPORT: process.env.NEXT_PUBLIC_STATIC_EXPORT || 'false',
  },
  // Configure specific routes to be dynamic
  async headers() {
    return [
      {
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'x-custom-header',
            value: 'dynamic-content',
          },
        ],
      },
    ];
  },
  // Webpack configuration to handle Privy during build
  webpack: (config, { isServer }) => {
    // If it's a server build, replace Privy with empty modules
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Add more Privy modules here if needed
        '@privy-io/react-auth': require.resolve('./src/mocks/privy-mock.js'),
      };
    }
    return config;
  },
}

// Create the mock file if it doesn't exist
const fs = require('fs');
const path = require('path');
const mockDir = path.join(__dirname, 'src', 'mocks');
const mockFile = path.join(mockDir, 'privy-mock.js');

if (!fs.existsSync(mockDir)) {
  fs.mkdirSync(mockDir, { recursive: true });
}

if (!fs.existsSync(mockFile)) {
  const mockContent = `
// Mock for Privy during SSR
module.exports = {
  usePrivy: () => ({}),
  useWallets: () => ({ wallets: [] }),
  PrivyProvider: ({ children }) => ({ type: 'div', props: { children } })
};
`;
  fs.writeFileSync(mockFile, mockContent);
}

module.exports = nextConfig
