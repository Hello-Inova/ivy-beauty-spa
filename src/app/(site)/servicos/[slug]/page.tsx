import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, CheckCircle2, Info, ArrowLeft, MessageCircle } from "lucide-react";
import { getCatalog, getAllServiceSlugs } from "@/lib/catalog.server";
import { formatBRL, formatDuration } from "@/lib/format";
import { whatsappLink, serviceInquiryMessage } from "@/lib/whatsapp";
import { ensureDynamic } from "@/lib/force-dynamic.server";

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

  const professionals = catalog.professionals.filter((p) => service.professionalIds.includes(p.id) && p.active);

  return (
    <div className="container-ivy py-12">
      <Link href="/servicos" className="inline-flex items-center gap-1.5 text-sm text-charcoal-soft hover:text-rose-deep">
        <ArrowLeft size={16} /> Voltar para serviços
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image src={service.image || "/images/placeholders/svc-spa-1.png"} alt={service.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
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
                      <Image src={p.photo || "/images/placeholders/pro-1.png"} alt={p.name} fill sizes="32px" className="object-cover" />
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
