import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { BUSINESS_INFO } from "@/data/seed-data";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-charcoal">
      <div className="absolute inset-0">
        <Image
          src="/images/placeholders/hero.png"
          alt="Ivy Beauty e Spa — imagem de destaque demonstrativa"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/20" />
      </div>

      <div className="container-ivy relative flex min-h-[86vh] flex-col items-start justify-end gap-6 py-20 sm:min-h-[80vh] sm:items-center sm:text-center">
        <span className="eyebrow flex items-center gap-2 text-blush">
          <Sparkles size={14} /> Beleza & Bem-estar
        </span>
        <h1 className="font-display max-w-2xl text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
          {BUSINESS_INFO.name}
        </h1>
        <p className="max-w-lg text-base text-cream/85 sm:text-lg">{BUSINESS_INFO.tagline}</p>
        <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/agendamento" className="btn-primary text-base">
            Agendar agora
          </Link>
          <Link
            href="/servicos"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-white hover:text-charcoal"
          >
            Ver serviços
          </Link>
        </div>
      </div>
    </section>
  );
}
