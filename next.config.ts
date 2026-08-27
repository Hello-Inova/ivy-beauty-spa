import type { NextConfig } from "next";

// Full/server mode — deployed with `next start` on any Node.js host
// (Vercel, Render, Railway, a VPS, etc.), backed by PostgreSQL.
// For the static "modo demonstração" build (GitHub Pages), see
// next.config.demo.ts and scripts/build-demo.sh.
const nextConfig: NextConfig = {
  images: {
    // Pre-generated local placeholder images — Image Optimization isn't
    // needed, and staying unoptimized keeps this config identical in spirit
    // to the static-export build.
    unoptimized: true,
  },
};

export default nextConfig;
