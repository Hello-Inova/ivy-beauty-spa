"use client";

import { Star, Quote } from "lucide-react";
import { TESTIMONIALS, type SeedTestimonial } from "@/data/seed-data";
import InfiniteCarousel from "./InfiniteCarousel";

const AVATAR_PALETTE = ["bg-rose-deep", "bg-rose-gold", "bg-sage", "bg-charcoal"];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function TestimonialCard({ review }: { review: SeedTestimonial }) {
  return (
    <div className="card-ivy relative flex h-full flex-col p-6">
      <Quote size={28} className="text-blush" />
      <div className="mt-3 flex items-center gap-0.5" aria-label={`${review.rating} de 5 estrelas`}>
        {Array.from({ length: 5 }).map((_, starIdx) => (
          <Star
            key={starIdx}
            size={15}
            className={starIdx < review.rating ? "fill-rose-gold text-rose-gold" : "text-charcoal/15"}
          />
        ))}
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-charcoal-soft">&ldquo;{review.quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white ${avatarColor(review.id)}`}
          aria-hidden="true"
        >
          {review.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-charcoal">{review.name}</p>
          <p className="text-xs text-charcoal-soft">{review.serviceName}</p>
        </div>
      </div>
      <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] text-rose-deep shadow-sm">
        Avaliação demonstrativa
      </span>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="avaliacoes" className="bg-blush-soft py-20">
      <div className="container-ivy">
        <div className="max-w-2xl">
          <span className="eyebrow">Avaliações</span>
          <h2 className="section-title mt-3">O que nossas clientes dizem</h2>
          <p className="mt-4 text-charcoal-soft">
            Depoimentos demonstrativos, criados para ilustrar como a seção de avaliações aparece no site — substitua
            pelas avaliações reais das suas clientes (Google, Instagram etc.) no painel administrativo.
          </p>
        </div>
      </div>

      <div className="container-ivy mt-10">
        <InfiniteCarousel
          items={TESTIMONIALS}
          keyExtractor={(review, i) => `${review.id}-${i}`}
          ariaLabel="Avaliações de clientes (demonstrativas)"
          durationSeconds={42}
          itemWidthClassName="w-[300px] sm:w-[340px]"
          renderItem={(review) => <TestimonialCard review={review} />}
        />
      </div>
    </section>
  );
}
