import type { Metadata } from "next";
import { Suspense } from "react";
import { getCatalog } from "@/lib/catalog.server";
import { ensureDynamic } from "@/lib/force-dynamic.server";
import BookingWizard from "@/components/booking/BookingWizard";

export const metadata: Metadata = {
  title: "Agendamento",
  description: "Agende seu horário na Ivy Beauty e Spa em poucos passos.",
};

export default async function AgendamentoPage() {
  await ensureDynamic();
  const catalog = await getCatalog();

  return (
    <Suspense fallback={<div className="container-ivy py-24 text-center text-charcoal-soft">Carregando...</div>}>
      <BookingWizard catalog={catalog} />
    </Suspense>
  );
}
