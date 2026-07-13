import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Replit preview proxies requests from a different origin/host,
     so the dev server must accept any incoming host header. */
  allowedDevOrigins: ["*"],
};

export default nextConfig;
