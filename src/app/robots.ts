import type { MetadataRoute } from "next";
import { IS_DEMO_MODE } from "@/lib/demo-mode";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ivybelezaespa.example.com";

// Static literal required for `output: "export"` (demo build). Content here
// only depends on the build-time IS_DEMO_MODE constant, never per-request
// state, so serving it statically is correct in both modes.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // The demo build (GitHub Pages) is kept out of search engines — it's a
  // fictional showcase, not the salon's real site.
  if (IS_DEMO_MODE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
