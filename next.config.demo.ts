import type { NextConfig } from "next";

// Static "modo demonstração" build — produces the `out/` folder that gets
// published to GitHub Pages by .github/workflows/deploy-demo.yml. No
// server, no database: the whole app runs client-side against
// localStorage (see src/lib/booking-client/local-client.ts).
//
// NEXT_PUBLIC_BASE_PATH is computed once in scripts/build-demo.sh (from
// GITHUB_REPOSITORY, or overridden manually for a local test build) and
// read here as-is — it must be the SAME value the app code inlines via
// src/lib/demo-mode.ts's withBasePath(), used for raw <img> tags that
// Next's own basePath/assetPrefix below don't reach.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
};

export default nextConfig;
