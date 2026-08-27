import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog.server";
import { ensureDynamic } from "@/lib/force-dynamic.server";
import ServicesCatalog from "@/components/site/ServicesCatalog";

export const metadata: Metadata = {
  title: "Serviços",
  description: "Conheça o catálogo completo de serviços da Ivy Beauty e Spa: cabelo, unhas, sobrancelhas, cílios, estética facial, depilação e spa.",
};

export default async function ServicosPage() {
  await ensureDynamic();
  const catalog = await getCatalog();

  return (
    <div className="container-ivy py-16">
      <div className="max-w-2xl">
        <span className="eyebrow">Nossos Serviços</span>
        <h1 className="section-title mt-3">Catálogo completo</h1>
        <p className="mt-4 text-charcoal-soft">
          Explore todos os nossos serviços por categoria, veja duração e valores, e agende em poucos cliques.
        </p>
      </div>

      <div className="mt-10">
        <ServicesCatalog catalog={catalog} />
      </div>
    </div>
  );
}
