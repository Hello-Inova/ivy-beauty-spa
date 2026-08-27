import Link from "next/link";
import ServiceCard from "./ServiceCard";
import type { CatalogService } from "@/lib/types";

export default function ServicesPreview({ services }: { services: CatalogService[] }) {
  const featured = services.filter((s) => s.active).slice(0, 6);

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

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
