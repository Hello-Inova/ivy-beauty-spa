import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
import type { CatalogService } from "@/lib/types";
import { formatBRL, formatDuration } from "@/lib/format";
import { withBasePath } from "@/lib/demo-mode";

export default function ServiceCard({ service }: { service: CatalogService }) {
  return (
    <div className="card-ivy group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[0_8px_30px_-8px_rgba(46,42,40,0.25)]">
      <Link href={`/servicos/${service.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={withBasePath(service.image || "/images/placeholders/svc-spa-1.png")}
          alt={service.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="eyebrow absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] text-rose-deep shadow-sm">
          {service.categoryName}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg text-charcoal">{service.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-charcoal-soft">{service.description}</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-charcoal-soft">
            <Clock size={15} /> {formatDuration(service.duration)}
          </span>
          <span className="font-display text-lg text-rose-deep">{formatBRL(service.price)}</span>
        </div>
        <div className="mt-5 flex items-center gap-2">
          <Link href={`/agendamento?servico=${service.slug}`} className="btn-primary flex-1 !py-2.5 text-sm">
            Agendar
          </Link>
          <Link
            href={`/servicos/${service.slug}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/15 text-charcoal transition-colors hover:border-rose-deep hover:text-rose-deep"
            aria-label={`Ver detalhes de ${service.name}`}
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
