import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import { BUSINESS_INFO } from "@/data/seed-data";
import { getCatalog } from "@/lib/catalog.server";
import { ensureDynamic } from "@/lib/force-dynamic.server";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Conheça a história, os valores e a equipe da Ivy Beauty e Spa.",
};

export default async function SobrePage() {
  await ensureDynamic();
  const catalog = await getCatalog();
  const professionals = catalog.professionals.filter((p) => p.active);

  return (
    <div>
      <section className="container-ivy py-16">
        <div className="max-w-2xl">
          <span className="eyebrow">Sobre nós</span>
          <h1 className="section-title mt-3">A {BUSINESS_INFO.name}</h1>
          <p className="mt-5 leading-relaxed text-charcoal-soft">{BUSINESS_INFO.aboutLong}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {["/images/placeholders/gallery-1.png", "/images/placeholders/gallery-2.png", "/images/placeholders/gallery-7.png"].map((src) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-2xl">
              <Image src={src} alt="Ambiente Ivy Beauty e Spa (imagem demonstrativa)" fill sizes="33vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {professionals.length > 0 && (
        <section className="bg-blush-soft py-16">
          <div className="container-ivy">
            <span className="eyebrow">Nossa equipe</span>
            <h2 className="section-title mt-3">Profissionais</h2>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {professionals.map((p) => (
                <div key={p.id} className="text-center">
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-[180px] overflow-hidden rounded-2xl">
                    <Image src={p.photo || "/images/placeholders/pro-1.png"} alt={p.name} fill sizes="180px" className="object-cover" />
                  </div>
                  <h3 className="mt-3 font-display text-base text-charcoal">{p.name}</h3>
                  {p.description && <p className="mt-1 text-xs text-charcoal-soft">{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-ivy py-16 text-center">
        <h2 className="section-title">Vamos cuidar de você</h2>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/agendamento" className="btn-primary">Agendar agora</Link>
          <a href={BUSINESS_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <Camera size={16} /> Ver Instagram
          </a>
        </div>
      </section>
    </div>
  );
}
