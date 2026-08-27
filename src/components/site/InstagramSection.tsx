import Image from "next/image";
import { Camera } from "lucide-react";
import { BUSINESS_INFO } from "@/data/seed-data";
import { withBasePath } from "@/lib/demo-mode";

const POSTS = [
  "/images/placeholders/gallery-4.png",
  "/images/placeholders/gallery-7.png",
  "/images/placeholders/gallery-8.png",
  "/images/placeholders/svc-cabelo-2.png",
  "/images/placeholders/svc-spa-2.png",
  "/images/placeholders/svc-unhas-1.png",
];

export default function InstagramSection() {
  return (
    <section className="container-ivy py-20 text-center">
      <span className="eyebrow inline-flex items-center gap-2">
        <Camera size={14} /> Instagram
      </span>
      <h2 className="section-title mt-3">Siga a {BUSINESS_INFO.name}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-charcoal-soft">
        Acompanhe novidades, bastidores e inspirações em {BUSINESS_INFO.instagramHandle}.
      </p>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3">
        {POSTS.map((src) => (
          <a
            key={src}
            href={BUSINESS_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-xl"
          >
            <Image src={withBasePath(src)} alt="Publicação demonstrativa do Instagram" fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal/0 transition-colors group-hover:bg-charcoal/40">
              <Camera size={22} className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </a>
        ))}
      </div>

      <a href={BUSINESS_INFO.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-8 inline-flex">
        <Camera size={16} /> {BUSINESS_INFO.instagramHandle}
      </a>

      <p className="mx-auto mt-4 max-w-md text-xs text-charcoal-soft/70">
        As imagens acima são placeholders demonstrativos — não foram extraídas do Instagram oficial (a leitura automática do perfil é bloqueada pelo robots.txt da plataforma).
      </p>
    </section>
  );
}
