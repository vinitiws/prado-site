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
};

// Em dev, usar /tmp/.next para evitar lentidão do filesystem do container
if (process.env.NODE_ENV === "development") {
  nextConfig.distDir = "/tmp/.next";
}

export default nextConfig;
