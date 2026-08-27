"use client";

import Link from "next/link";
import ServiceCard from "./ServiceCard";
import InfiniteCarousel from "./InfiniteCarousel";
import type { Catalog } from "@/lib/types";
import { useLiveCatalog } from "@/lib/use-live-catalog";

export default function ServicesPreview({ catalog: initialCatalog }: { catalog: Catalog }) {
  const catalog = useLiveCatalog(initialCatalog);
  const featured = catalog.services.filter((s) => s.active);

  return (
    <section id="servicos" className="bg-cream-deep py-20">
      <div className="container-ivy">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">Nossos Serviços</span>
            <h2 className="section-title mt-3">Cuidados pensados para você</h2>
          </div>
          <Link href="/servicos" className="btn-ghost">
            Ver todos os serviços →
          </Link>
        </div>
      </div>

      <div className="container-ivy mt-10">
        <InfiniteCarousel
          items={featured}
          keyExtractor={(service, i) => `${service.id}-${i}`}
          ariaLabel="Nossos serviços"
          durationSeconds={46}
          itemWidthClassName="w-[280px] sm:w-[320px]"
          renderItem={(service) => <ServiceCard service={service} />}
        />
      </div>
    </section>
  );
}
