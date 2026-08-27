import type { Metadata } from "next";
import Image from "next/image";
import { withBasePath } from "@/lib/demo-mode";

export const metadata: Metadata = {
  title: "Galeria",
  description: "Galeria de fotos do ambiente, resultados, produtos e experiências da Ivy Beauty e Spa.",
};

const GALLERY = [
  { src: "/images/placeholders/gallery-1.png", label: "Ambiente" },
  { src: "/images/placeholders/gallery-2.png", label: "Ambiente" },
  { src: "/images/placeholders/gallery-7.png", label: "Ambiente" },
  { src: "/images/placeholders/gallery-3.png", label: "Resultados" },
  { src: "/images/placeholders/gallery-4.png", label: "Resultados" },
  { src: "/images/placeholders/gallery-8.png", label: "Resultados" },
  { src: "/images/placeholders/gallery-5.png", label: "Produtos" },
  { src: "/images/placeholders/gallery-6.png", label: "Experiências" },
  { src: "/images/placeholders/svc-spa-2.png", label: "Experiências" },
];

export default function GaleriaPage() {
  return (
    <div className="container-ivy py-16">
      <div className="max-w-2xl">
        <span className="eyebrow">Galeria</span>
        <h1 className="section-title mt-3">Ambiente, resultados e experiências</h1>
        <p className="mt-4 text-charcoal-soft">
          As imagens abaixo são placeholders de demonstração, prontos para serem substituídos por fotos reais no painel administrativo.
        </p>
      </div>

      <div className="mt-10 columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
        {GALLERY.map((item, i) => (
          <div key={`${item.src}-${i}`} className="group relative overflow-hidden rounded-2xl break-inside-avoid">
            <Image
              src={withBasePath(item.src)}
              alt={`${item.label} — imagem demonstrativa`}
              width={700}
              height={700}
              sizes="(max-width: 640px) 50vw, 33vw"
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-charcoal/50 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-xs font-medium text-white">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
