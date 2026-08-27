import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog, getAllServiceSlugs } from "@/lib/catalog.server";
import { ensureDynamic } from "@/lib/force-dynamic.server";
import ServiceDetailView from "@/components/site/ServiceDetailView";

// Note: in demo mode (static export) there is no server to render unknown
// slugs on demand — only the slugs known at build time get a detail page.
// A service an admin adds afterwards, in the demo's localStorage, simply
// won't have one there; this is a documented limitation of the GitHub
// Pages demo (see README).

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const service = catalog.services.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.description,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await ensureDynamic();
  const { slug } = await params;
  const catalog = await getCatalog();
  const service = catalog.services.find((s) => s.slug === slug);
  if (!service || !service.active) notFound();

  return <ServiceDetailView slug={slug} initialCatalog={catalog} initialService={service} />;
}
