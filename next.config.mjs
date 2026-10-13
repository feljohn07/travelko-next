import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // optimized for VPS (Node.js) deployment
  turbopack: {
    root: path.resolve('.'),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.travelkoph.com' },
      { protocol: 'https', hostname: 'api.travelko.site' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
};

export default nextConfig;
