"use client";

import { useMemo, useState } from "react";
import ServiceCard from "./ServiceCard";
import type { Catalog } from "@/lib/types";

export default function ServicesCatalog({ catalog }: { catalog: Catalog }) {
  const activeCategories = catalog.categories
    .filter((c) => c.active && catalog.services.some((s) => s.categoryId === c.id && s.active))
    .sort((a, b) => a.order - b.order);

  const [selected, setSelected] = useState<string | null>(null);

  const services = useMemo(() => {
    return catalog.services
      .filter((s) => s.active)
      .filter((s) => (selected ? s.categoryId === selected : true));
  }, [catalog.services, selected]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
            selected === null ? "bg-rose-deep text-white" : "bg-blush-soft text-charcoal hover:bg-blush"
          }`}
        >
          Todos
        </button>
        {activeCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelected(cat.id)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              selected === cat.id ? "bg-rose-deep text-white" : "bg-blush-soft text-charcoal hover:bg-blush"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {services.length === 0 ? (
        <p className="mt-12 text-center text-charcoal-soft">Nenhum serviço encontrado nesta categoria.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
