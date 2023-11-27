const withImages = require('next-images');

const nextConfig = {
  reactStrictMode: process.env.NODE_ENV !== 'development',
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development',
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|png|ico)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=9999999999, must-revalidate',
          },
        ],
      },
    ];
  },
};

const plugins = [withImages];

const config = plugins.reduce((acc, plugin) => plugin(acc), { ...nextConfig });

module.exports = config;
