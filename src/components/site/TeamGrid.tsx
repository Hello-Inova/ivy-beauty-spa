"use client";

import Image from "next/image";
import type { Catalog } from "@/lib/types";
import { withBasePath } from "@/lib/demo-mode";
import { useLiveCatalog } from "@/lib/use-live-catalog";

/** "Nossa equipe" section on /sobre — re-hydrates from the live catalog so
 * a professional's photo edited in the admin panel (demo mode) shows up
 * here too, not just in the admin panel itself. */
export default function TeamGrid({ initialCatalog }: { initialCatalog: Catalog }) {
  const catalog = useLiveCatalog(initialCatalog);
  const professionals = catalog.professionals.filter((p) => p.active);

  if (professionals.length === 0) return null;

  return (
    <section className="bg-blush-soft py-16">
      <div className="container-ivy">
        <span className="eyebrow">Nossa equipe</span>
        <h2 className="section-title mt-3">Profissionais</h2>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {professionals.map((p) => (
            <div key={p.id} className="text-center">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[180px] overflow-hidden rounded-2xl">
                <Image src={withBasePath(p.photo || "/images/placeholders/pro-1.png")} alt={p.name} fill sizes="180px" className="object-cover" />
              </div>
              <h3 className="mt-3 font-display text-base text-charcoal">{p.name}</h3>
              {p.description && <p className="mt-1 text-xs text-charcoal-soft">{p.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
