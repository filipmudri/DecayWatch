import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow development assets when opening this PC through its LAN address.
  allowedDevOrigins: ["192.168.31.62"],
};

export default nextConfig;
