import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  allowedDevOrigins: ["*.replit.dev", "*.kirk.replit.dev", "*.spock.replit.dev", "*.riker.replit.dev", "*.picard.replit.dev", "*.worf.replit.dev", "*.sisko.replit.dev", "*.janeway.replit.dev", "*.crusher.replit.dev", "*.data.replit.dev", "127.0.0.1"],
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    formats: ["image/avif", "image/webp"],
    qualities: [50, 60, 70, 75, 80, 90, 100],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*.(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/pages/shipping",
        destination: "/pages/shipping-policy",
        permanent: true,
      },
      {
        source: "/pages/shipping-and-delivery",
        destination: "/pages/shipping-policy",
        permanent: true,
      },
      {
        source: "/shipping",
        destination: "/pages/shipping-policy",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/pages/about-us",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/pages/contact",
        permanent: true,
      },
      {
        source: "/track-order",
        destination: "/pages/track-order",
        permanent: true,
      },
      {
        source: "/hijabs",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/abayas",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/accessories",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/faq",
        destination: "/pages/faq",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/pages/privacy-policy",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/pages/terms-of-service",
        permanent: true,
      },
    ];
  },
} as NextConfig;

export default nextConfig;
