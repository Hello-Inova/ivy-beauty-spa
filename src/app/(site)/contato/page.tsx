import type { Metadata } from "next";
import { Camera, MessageCircle, MapPin, Clock } from "lucide-react";
import { BUSINESS_INFO, WEEKDAY_LABEL, WEEKDAY_ORDER } from "@/data/seed-data";
import { getCatalog } from "@/lib/catalog.server";
import { whatsappLink, generalInquiryMessage } from "@/lib/whatsapp";
import { ensureDynamic } from "@/lib/force-dynamic.server";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Ivy Beauty e Spa pelo WhatsApp ou Instagram.",
};

export default async function ContatoPage() {
  await ensureDynamic();
  const catalog = await getCatalog();
  const hoursByWeekday = new Map(catalog.businessHours.map((h) => [h.weekday, h]));

  return (
    <div className="container-ivy py-16">
      <div className="max-w-2xl">
        <span className="eyebrow">Contato</span>
        <h1 className="section-title mt-3">Fale com a gente</h1>
        <p className="mt-4 text-charcoal-soft">
          Tire dúvidas, peça informações sobre um serviço ou agende diretamente pelo WhatsApp.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="card-ivy space-y-5 p-6 sm:p-8">
          <a
            href={whatsappLink(generalInquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl bg-blush-soft p-4 transition-colors hover:bg-blush"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
              <MessageCircle size={20} />
            </span>
            <div>
              <p className="text-sm text-charcoal-soft">WhatsApp</p>
              <p className="font-display text-lg text-charcoal">{BUSINESS_INFO.whatsappDisplay}</p>
            </div>
          </a>

          <a
            href={BUSINESS_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl bg-blush-soft p-4 transition-colors hover:bg-blush"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-deep text-white">
              <Camera size={20} />
            </span>
            <div>
              <p className="text-sm text-charcoal-soft">Instagram</p>
              <p className="font-display text-lg text-charcoal">{BUSINESS_INFO.instagramHandle}</p>
            </div>
          </a>

          <div className="flex items-center gap-4 rounded-2xl bg-blush-soft p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-charcoal text-white">
              <MapPin size={20} />
            </span>
            <div>
              <p className="text-sm text-charcoal-soft">Endereço</p>
              <p className="font-display text-lg text-charcoal">{BUSINESS_INFO.addressLine}</p>
            </div>
          </div>
        </div>

        <div className="card-ivy p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-lg text-charcoal">
            <Clock size={18} className="text-rose-deep" /> Horário de funcionamento
          </h2>
          <ul className="mt-4 divide-y divide-charcoal/10">
            {WEEKDAY_ORDER.map((weekday) => {
              const h = hoursByWeekday.get(weekday);
              return (
                <li key={weekday} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-charcoal">{WEEKDAY_LABEL[weekday]}</span>
                  <span className={h?.isOpen ? "text-charcoal-soft" : "text-charcoal-soft/60"}>
                    {h?.isOpen ? `${h.startTime} às ${h.endTime}` : "Fechado"}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-charcoal-soft/70">
            Horários provisórios — ajuste em Painel administrativo → Horários.
          </p>
        </div>
      </div>
    </div>
  );
}
