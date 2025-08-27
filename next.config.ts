import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Don't block Vercel build on ESLint errors
  },
  /* other config options here */
};

export default nextConfig;
