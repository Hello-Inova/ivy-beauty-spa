import "server-only";
import { IS_DEMO_MODE } from "./demo-mode";
import type { Catalog, CatalogCategory, CatalogProfessional, CatalogService } from "./types";
import {
  CATEGORIES,
  SERVICES,
  PROFESSIONALS,
  BUSINESS_HOURS,
  HOLIDAYS,
} from "@/data/seed-data";

/**
 * Server-side catalog reader. In demo mode (static export for GitHub Pages)
 * it reads the bundled seed data directly — no network, no database, works
 * at build time via generateStaticParams too. In full mode it queries
 * Postgres through Drizzle. Either way, Server Components get the exact
 * same `Catalog` shape.
 */
export async function getCatalog(): Promise<Catalog> {
  if (IS_DEMO_MODE) {
    return demoCatalog();
  }
  const { getCatalog: getDbCatalog } = await import("@/db/queries");
  return getDbCatalog();
}

function demoCatalog(): Catalog {
  const categories: CatalogCategory[] = CATEGORIES.map((c) => ({ ...c }));

  const services: CatalogService[] = SERVICES.map((s) => {
    const cat = CATEGORIES.find((c) => c.id === s.categoryId);
    return {
      id: s.id,
      categoryId: s.categoryId,
      categorySlug: cat?.slug ?? "",
      categoryName: cat?.name ?? "",
      name: s.name,
      slug: s.slug,
      description: s.description,
      benefits: s.benefits,
      importantInfo: s.importantInfo,
      duration: s.duration,
      price: s.price,
      image: s.image,
      active: s.active,
      professionalIds: s.professionalIds,
    };
  });

  const professionals: CatalogProfessional[] = PROFESSIONALS.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    photo: p.photo,
    active: p.active,
    serviceIds: SERVICES.filter((s) => s.professionalIds.includes(p.id)).map((s) => s.id),
    workingHours: p.workingHours,
    blockedDates: p.blockedDates,
  }));

  return {
    categories,
    services,
    professionals,
    businessHours: BUSINESS_HOURS,
    holidays: HOLIDAYS,
  };
}

export async function getServiceBySlug(slug: string) {
  const catalog = await getCatalog();
  return catalog.services.find((s) => s.slug === slug) ?? null;
}

export async function getAllServiceSlugs(): Promise<string[]> {
  const catalog = await getCatalog();
  return catalog.services.map((s) => s.slug);
}
