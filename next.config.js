/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // Enable edge runtime for better performance on Cloudflare Workers
  experimental: {
    runtime: 'edge',
  },
};

module.exports = nextConfig;