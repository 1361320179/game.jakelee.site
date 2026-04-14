import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@game/content", "@game/ui", "@game/super-mario"],
};

export default nextConfig;
