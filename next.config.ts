import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Airtable attachment URLs for next/image optimization
  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.airtableusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'dl.airtable.com',
      },
    ],
  },
};

export default nextConfig;
