import type { NextConfig } from "next";

// Static "modo demonstração" build — produces the `out/` folder that gets
// published to GitHub Pages by .github/workflows/deploy-demo.yml. No
// server, no database: the whole app runs client-side against
// localStorage (see src/lib/booking-client/local-client.ts).
//
// GITHUB_REPOSITORY is provided automatically by GitHub Actions
// ("owner/repo"); NEXT_PUBLIC_BASE_PATH can also be set manually for a
// local test build (see scripts/build-demo.sh).
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
// A "<user>.github.io" repo is served at the domain root (no basePath);
// any other repo is served at "/<repo-name>/".
const inferredBasePath = repo && !repo.endsWith(".github.io") ? `/${repo}` : "";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || inferredBasePath;

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
};

export default nextConfig;
