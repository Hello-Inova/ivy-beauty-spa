import type { MetadataRoute } from "next";
import { getAllServiceSlugs } from "@/lib/catalog.server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ivybelezaespa.example.com";

// Static literal required for `output: "export"` (demo build); it was
// already being rendered statically in server mode too, so this just makes
// that explicit rather than inferred.
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllServiceSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/servicos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/galeria`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contato`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/agendamento`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/servicos/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes];
}
