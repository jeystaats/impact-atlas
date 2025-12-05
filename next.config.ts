import type { NextConfig } from "next";
import path from "path";

// Security headers including CSP for Umami analytics
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self, Umami, Clerk, Vercel Live, inline for Next.js
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cloud.umami.is https://*.clerk.accounts.dev https://vercel.live",
      // Styles: self, inline for Tailwind/Framer
      "style-src 'self' 'unsafe-inline'",
      // Images: self, data URIs, Mapbox, Clerk, Unsplash, blob for dynamic images
      "img-src 'self' data: blob: https://*.mapbox.com https://*.clerk.com https://img.clerk.com https://images.unsplash.com",
      // Fonts: self, Google Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Connect: APIs, Mapbox, Convex, Clerk, Umami, Vercel Live
      "connect-src 'self' https://*.mapbox.com https://*.convex.cloud wss://*.convex.cloud https://*.clerk.accounts.dev https://*.accounts.dev https://cloud.umami.is https://clerk-telemetry.com https://api-gateway.umami.dev https://vercel.live wss://vercel.live",
      // Frames: Clerk for auth
      "frame-src 'self' https://*.clerk.accounts.dev https://*.accounts.dev https://vercel.live",
      // Workers: self and blob for Mapbox
      "worker-src 'self' blob:",
      // Child sources
      "child-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ["react-map-gl", "mapbox-gl"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
