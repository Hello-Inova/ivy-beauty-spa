"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, CheckCircle2, Info, ArrowLeft, MessageCircle } from "lucide-react";
import type { Catalog, CatalogService } from "@/lib/types";
import { formatBRL, formatDuration } from "@/lib/format";
import { whatsappLink, serviceInquiryMessage } from "@/lib/whatsapp";
import { withBasePath } from "@/lib/demo-mode";
import { useLiveCatalog } from "@/lib/use-live-catalog";

/**
 * Renders the service detail page body. Takes the build-time/per-request
 * service as a fallback (`initialService`), but re-derives the freshest
 * version from `useLiveCatalog` once available, so photos or other fields
 * an admin edited afterwards (demo mode) show up here too.
 */
export default function ServiceDetailView({
  slug,
  initialCatalog,
  initialService,
}: {
  slug: string;
  initialCatalog: Catalog;
  initialService: CatalogService;
}) {
  const catalog = useLiveCatalog(initialCatalog);
  const service = catalog.services.find((s) => s.slug === slug) ?? initialService;
  const professionals = catalog.professionals.filter((p) => service.professionalIds.includes(p.id) && p.active);

  return (
    <div className="container-ivy py-12">
      <Link href="/servicos" className="inline-flex items-center gap-1.5 text-sm text-charcoal-soft hover:text-rose-deep">
        <ArrowLeft size={16} /> Voltar para serviços
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={withBasePath(service.image || "/images/placeholders/svc-spa-1.png")} alt={service.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
          </div>
          {service.images.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {service.images.slice(0, 3).map((src, i) => (
                <div key={`${src}-${i}`} className="relative aspect-square overflow-hidden rounded-xl">
                  <Image src={withBasePath(src)} alt={`${service.name} — foto ${i + 1} (demonstrativa)`} fill sizes="150px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="eyebrow">{service.categoryName}</span>
          <h1 className="section-title mt-2">{service.name}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 rounded-full bg-blush-soft px-4 py-2 text-sm text-charcoal">
              <Clock size={16} /> {formatDuration(service.duration)}
            </span>
            <span className="font-display text-2xl text-rose-deep">{formatBRL(service.price)}</span>
          </div>

          <p className="mt-6 leading-relaxed text-charcoal-soft">{service.description}</p>

          {service.benefits && (
            <div className="mt-6">
              <h2 className="flex items-center gap-2 font-display text-lg text-charcoal">
                <CheckCircle2 size={18} className="text-sage" /> Benefícios
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">{service.benefits}</p>
            </div>
          )}

          {service.importantInfo && (
            <div className="mt-6 flex gap-2 rounded-2xl bg-blush-soft p-4 text-sm text-charcoal-soft">
              <Info size={18} className="mt-0.5 shrink-0 text-rose-deep" />
              <p>{service.importantInfo}</p>
            </div>
          )}

          {professionals.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-lg text-charcoal">Realizado por</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {professionals.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 rounded-full bg-blush-soft py-1.5 pl-1.5 pr-4">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                      <Image src={withBasePath(p.photo || "/images/placeholders/pro-1.png")} alt={p.name} fill sizes="32px" className="object-cover" />
                    </div>
                    <span className="text-sm text-charcoal">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/agendamento?servico=${service.slug}`} className="btn-primary flex-1">
              Agendar este serviço
            </Link>
            <a href={whatsappLink(serviceInquiryMessage(service.name))} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1">
              <MessageCircle size={16} /> Perguntar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
