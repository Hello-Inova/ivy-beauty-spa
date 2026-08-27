import Image from "next/image";
import Link from "next/link";

const GALLERY_ITEMS = [
  { src: "/images/placeholders/gallery-1.png", label: "Ambiente" },
  { src: "/images/placeholders/gallery-3.png", label: "Resultados" },
  { src: "/images/placeholders/gallery-5.png", label: "Produtos" },
  { src: "/images/placeholders/gallery-6.png", label: "Experiências" },
];

export default function GallerySection({ compact = true }: { compact?: boolean }) {
  return (
    <section className="bg-blush-soft py-20">
      <div className="container-ivy">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">Galeria</span>
            <h2 className="section-title mt-3">Nosso espaço e resultados</h2>
          </div>
          {compact && (
            <Link href="/galeria" className="btn-ghost">
              Ver galeria completa →
            </Link>
          )}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {GALLERY_ITEMS.map((item) => (
            <div key={item.src} className="group relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src={item.src}
                alt={`${item.label} — imagem demonstrativa`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-charcoal/60 via-transparent to-transparent p-4">
                <span className="text-sm font-medium text-white">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
