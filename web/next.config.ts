import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only badge: keep it off the sidebar's user card (bottom-left).
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
