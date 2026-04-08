import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@game/content", "@game/ui"],
};

export default nextConfig;
