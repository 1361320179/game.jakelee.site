import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@game/content", "@game/ui", "@game/shadow-dash"],
};

export default nextConfig;
