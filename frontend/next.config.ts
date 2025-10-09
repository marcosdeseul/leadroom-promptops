import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@chakra-ui/react', 'lucide-react'],
  },
};

export default nextConfig;
