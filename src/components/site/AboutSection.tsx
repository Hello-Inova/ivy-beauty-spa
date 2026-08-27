import Image from "next/image";
import Link from "next/link";
import { Heart, Leaf, Sparkles, Users } from "lucide-react";
import { BUSINESS_INFO } from "@/data/seed-data";

const PILLARS = [
  { icon: Heart, label: "Autocuidado" },
  { icon: Leaf, label: "Bem-estar" },
  { icon: Sparkles, label: "Sofisticação" },
  { icon: Users, label: "Atendimento personalizado" },
];

export default function AboutSection() {
  return (
    <section id="sobre" className="container-ivy py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative order-2 aspect-[4/5] overflow-hidden rounded-3xl lg:order-1">
          <Image
            src="/images/placeholders/gallery-2.png"
            alt="Ambiente da Ivy Beauty e Spa (imagem demonstrativa)"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="order-1 lg:order-2">
          <span className="eyebrow">Sobre nós</span>
          <h2 className="section-title mt-3">Um espaço para se reencontrar</h2>
          <p className="mt-5 text-base leading-relaxed text-charcoal-soft">{BUSINESS_INFO.aboutLong}</p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PILLARS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 rounded-2xl bg-blush-soft px-3 py-5 text-center">
                <Icon size={20} className="text-rose-deep" />
                <span className="text-xs font-medium text-charcoal">{label}</span>
              </div>
            ))}
          </div>

          <Link href="/sobre" className="btn-secondary mt-8 inline-flex">
            Conheça nossa história
          </Link>
        </div>
      </div>
    </section>
  );
}
