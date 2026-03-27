import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  allowedDevOrigins: ["*.replit.dev", "*.kirk.replit.dev", "*.spock.replit.dev", "*.riker.replit.dev", "*.picard.replit.dev", "*.worf.replit.dev", "127.0.0.1"],
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
} as NextConfig;

export default nextConfig;
