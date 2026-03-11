import type { NextConfig } from 'next';

const s3Hostname = process.env.S3_HOSTNAME || '';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: s3Hostname
      ? [
          {
            protocol: 'https',
            hostname: s3Hostname,
          },
        ]
      : [],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
