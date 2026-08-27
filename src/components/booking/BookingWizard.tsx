"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  MessageCircle,
  Users,
} from "lucide-react";
import type { Catalog, AppointmentRecord } from "@/lib/types";
import { bookingClient } from "@/lib/booking-client";
import { professionalWorksOnDate, todayISO } from "@/lib/availability";
import { formatBRL, formatDateLong, formatDuration } from "@/lib/format";
import { whatsappLink, bookingConfirmationMessage } from "@/lib/whatsapp";
import Calendar from "./Calendar";

const STEP_LABELS = ["Serviço", "Profissional", "Data", "Horário", "Seus dados", "Confirmação"];

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function digitsOnly(v: string) {
  return v.replace(/\D/g, "");
}

export default function BookingWizard({ catalog }: { catalog: Catalog }) {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("servico");

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<AppointmentRecord | null>(null);

  useEffect(() => {
    if (preselected) {
      const svc = catalog.services.find((s) => s.slug === preselected && s.active);
      if (svc) {
        setServiceId(svc.id);
        setStep(2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselected]);

  const service = useMemo(() => catalog.services.find((s) => s.id === serviceId) ?? null, [catalog, serviceId]);
  const eligibleProfessionals = useMemo(
    () => (service ? catalog.professionals.filter((p) => p.active && service.professionalIds.includes(p.id)) : []),
    [catalog, service]
  );
  const chosenProfessional = professionalId && professionalId !== "any" ? catalog.professionals.find((p) => p.id === professionalId) ?? null : null;

  useEffect(() => {
    if (!serviceId || !professionalId || !date) return;
    setLoadingSlots(true);
    setStartTime(null);
    bookingClient
      .getAvailableSlots(serviceId, professionalId, date)
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [serviceId, professionalId, date]);

  function isDateDisabled(iso: string): boolean {
    if (!service) return true;
    const candidates = professionalId === "any" ? eligibleProfessionals : eligibleProfessionals.filter((p) => p.id === professionalId);
    return !candidates.some((p) => professionalWorksOnDate(iso, catalog.businessHours, p.workingHours, p.blockedDates.map((b) => b.date)));
  }

  function goTo(n: number) {
    setStep(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateCustomerForm(): boolean {
    const errors: Record<string, string> = {};
    if (customerName.trim().length < 2) errors.name = "Informe seu nome completo.";
    if (digitsOnly(customerWhatsapp).length < 10) errors.whatsapp = "Informe um WhatsApp válido com DDD.";
    if (customerEmail && !isValidEmail(customerEmail)) errors.email = "E-mail inválido.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleConfirm() {
    if (!service || !professionalId || !date || !startTime) return;
    setSubmitting(true);
    setSubmitError(null);
    const res = await bookingClient.createAppointment({
      serviceId: service.id,
      professionalId,
      date,
      startTime,
      customerName: customerName.trim(),
      customerWhatsapp: customerWhatsapp.trim(),
      customerEmail: customerEmail.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(res.error);
      return;
    }
    setResult(res.data);
  }

  if (result) {
    return <SuccessScreen appointment={result} />;
  }

  return (
    <div className="container-ivy max-w-3xl py-12">
      <div className="mb-10">
        <div className="flex items-center justify-between text-xs text-charcoal-soft">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className={`flex-1 text-center ${i + 1 === step ? "font-semibold text-rose-deep" : ""}`}>
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blush-soft">
          <div
            className="h-full rounded-full bg-rose-deep transition-all duration-300"
            style={{ width: `${(step / STEP_LABELS.length) * 100}%` }}
          />
        </div>
      </div>

      {step > 1 && (
        <button
          type="button"
          onClick={() => goTo(step - 1)}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-charcoal-soft hover:text-rose-deep"
        >
          <ChevronLeft size={16} /> Voltar
        </button>
      )}

      {step === 1 && (
        <div>
          <h1 className="section-title">Escolha o serviço</h1>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {catalog.services
              .filter((s) => s.active)
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setServiceId(s.id);
                    setProfessionalId(null);
                    setDate(null);
                    goTo(2);
                  }}
                  className="card-ivy flex items-center gap-3 p-3 text-left transition-shadow hover:shadow-md"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image src={s.image || "/images/placeholders/svc-spa-1.png"} alt={s.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base text-charcoal">{s.name}</p>
                    <p className="text-xs text-charcoal-soft">{s.categoryName} · {formatDuration(s.duration)}</p>
                  </div>
                  <span className="shrink-0 font-display text-rose-deep">{formatBRL(s.price)}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {step === 2 && service && (
        <div>
          <h1 className="section-title">Escolha a profissional</h1>
          <p className="mt-2 text-sm text-charcoal-soft">Serviço selecionado: <strong>{service.name}</strong></p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setProfessionalId("any");
                setDate(null);
                goTo(3);
              }}
              className="card-ivy flex items-center gap-3 p-4 text-left transition-shadow hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blush-soft text-rose-deep">
                <Users size={22} />
              </span>
              <div>
                <p className="font-display text-base text-charcoal">Qualquer profissional disponível</p>
                <p className="text-xs text-charcoal-soft">Mais horários disponíveis</p>
              </div>
            </button>
            {eligibleProfessionals.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setProfessionalId(p.id);
                  setDate(null);
                  goTo(3);
                }}
                className="card-ivy flex items-center gap-3 p-4 text-left transition-shadow hover:shadow-md"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <Image src={p.photo || "/images/placeholders/pro-1.png"} alt={p.name} fill sizes="48px" className="object-cover" />
                </div>
                <div>
                  <p className="font-display text-base text-charcoal">{p.name}</p>
                  {p.description && <p className="line-clamp-1 text-xs text-charcoal-soft">{p.description}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && service && professionalId && (
        <div>
          <h1 className="section-title">Escolha a data</h1>
          <p className="mt-2 text-sm text-charcoal-soft">
            {chosenProfessional ? `Com ${chosenProfessional.name}` : "Qualquer profissional disponível"}
          </p>
          <div className="mt-6">
            <Calendar
              selected={date}
              onSelect={(iso) => {
                setDate(iso);
                goTo(4);
              }}
              isDateDisabled={isDateDisabled}
              minDate={todayISO()}
            />
          </div>
        </div>
      )}

      {step === 4 && date && (
        <div>
          <h1 className="section-title">Escolha o horário</h1>
          <p className="mt-2 text-sm text-charcoal-soft">{formatDateLong(date)}</p>
          <div className="mt-6">
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-charcoal-soft">
                <Loader2 size={18} className="animate-spin" /> Carregando horários...
              </div>
            ) : slots.length === 0 ? (
              <div className="card-ivy p-6 text-center text-sm text-charcoal-soft">
                Nenhum horário disponível nesta data. Volte e escolha outra data.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setStartTime(slot);
                      goTo(5);
                    }}
                    className="rounded-xl border border-charcoal/10 bg-ivory py-3 text-sm font-medium text-charcoal transition-colors hover:border-rose-deep hover:bg-blush-soft"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h1 className="section-title">Seus dados</h1>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (validateCustomerForm()) goTo(6);
            }}
          >
            <div>
              <label className="text-sm font-medium text-charcoal" htmlFor="name">Nome completo *</label>
              <input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-rose-deep"
                placeholder="Seu nome"
              />
              {formErrors.name && <p className="mt-1 text-xs text-rose-deep">{formErrors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal" htmlFor="whatsapp">WhatsApp *</label>
              <input
                id="whatsapp"
                value={customerWhatsapp}
                onChange={(e) => setCustomerWhatsapp(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-rose-deep"
                placeholder="(11) 99999-9999"
                inputMode="tel"
              />
              {formErrors.whatsapp && <p className="mt-1 text-xs text-rose-deep">{formErrors.whatsapp}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal" htmlFor="email">E-mail</label>
              <input
                id="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-rose-deep"
                placeholder="voce@email.com"
                type="email"
              />
              {formErrors.email && <p className="mt-1 text-xs text-rose-deep">{formErrors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal" htmlFor="notes">Observações (opcional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-charcoal/15 bg-ivory px-4 py-3 text-sm outline-none focus:border-rose-deep"
                placeholder="Alguma preferência ou observação?"
              />
            </div>
            <button type="submit" className="btn-primary w-full">Continuar</button>
          </form>
        </div>
      )}

      {step === 6 && service && date && startTime && (
        <div>
          <h1 className="section-title">Confirme seu agendamento</h1>
          <div className="card-ivy mt-6 divide-y divide-charcoal/10 p-6">
            <SummaryRow label="Serviço" value={service.name} />
            <SummaryRow label="Profissional" value={chosenProfessional ? chosenProfessional.name : "Qualquer profissional disponível"} />
            <SummaryRow label="Data" value={formatDateLong(date)} />
            <SummaryRow label="Horário" value={startTime} />
            <SummaryRow label="Valor" value={formatBRL(service.price)} />
            <SummaryRow label="Cliente" value={customerName} />
            <SummaryRow label="WhatsApp" value={customerWhatsapp} />
          </div>

          {submitError && (
            <div className="mt-4 rounded-xl bg-rose/10 p-4 text-sm text-rose-deep">
              {submitError}{" "}
              <button type="button" onClick={() => goTo(4)} className="font-medium underline">
                Escolher outro horário
              </button>
            </div>
          )}

          <button type="button" onClick={handleConfirm} disabled={submitting} className="btn-primary mt-6 w-full">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            Confirmar agendamento
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="text-charcoal-soft">{label}</span>
      <span className="font-medium text-charcoal">{value}</span>
    </div>
  );
}

function SuccessScreen({ appointment }: { appointment: AppointmentRecord }) {
  const message = bookingConfirmationMessage({
    serviceName: appointment.serviceName,
    date: appointment.date,
    startTime: appointment.startTime,
    customerName: appointment.customerName,
    professionalName: appointment.professionalName,
  });

  return (
    <div className="container-ivy max-w-xl py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/30 text-sage">
        <Check size={32} />
      </div>
      <h1 className="section-title mt-6">Agendamento realizado com sucesso! 💖</h1>
      <p className="mt-2 text-sm text-charcoal-soft">Código do agendamento: <strong>{appointment.code}</strong></p>

      <div className="card-ivy mt-8 divide-y divide-charcoal/10 p-6 text-left">
        <SummaryRow label="Serviço" value={appointment.serviceName} />
        <SummaryRow label="Profissional" value={appointment.professionalName} />
        <SummaryRow label="Data" value={formatDateLong(appointment.date)} />
        <SummaryRow label="Horário" value={appointment.startTime} />
        <SummaryRow label="Valor" value={formatBRL(appointment.priceAtBooking)} />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1">
          <MessageCircle size={18} /> Falar pelo WhatsApp
        </a>
        <Link href="/" className="btn-secondary flex-1">
          Voltar ao início
        </Link>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-charcoal-soft">
        <Clock size={14} /> Chegue com 10 minutos de antecedência.
      </p>
    </div>
  );
}
