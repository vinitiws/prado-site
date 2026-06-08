import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Turbopack filesystem cache reduces memory by persisting compilation artifacts to disk
  experimental: {
    turbopackFileSystemCacheForDev: true,
    // Disable preloading all entries on start to lower baseline memory usage
    preloadEntriesOnStart: false,
  },
};

export default nextConfig;
