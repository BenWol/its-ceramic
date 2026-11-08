import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos live in public/media; a changed photo gets a new file name, so it's safe to cache for a year
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
