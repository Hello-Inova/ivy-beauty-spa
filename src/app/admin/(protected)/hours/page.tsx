"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { bookingClient } from "@/lib/booking-client";
import type { BusinessHourInput } from "@/lib/booking-client";
import type { Catalog, BlockedDateRecord, Weekday } from "@/lib/types";
import { WEEKDAY_ORDER, WEEKDAY_LABEL } from "@/data/seed-data";
import { formatDateShort } from "@/lib/format";

export default function HoursPage() {
  const [businessHours, setBusinessHours] = useState<BusinessHourInput[]>([]);
  const [holidays, setHolidays] = useState<{ id: string; date: string; name: string }[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDateRecord[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [savingDay, setSavingDay] = useState<Weekday | null>(null);

  async function refresh() {
    const [bh, hol, blocked, cat] = await Promise.all([
      bookingClient.getBusinessHours(),
      bookingClient.listHolidays(),
      bookingClient.listBlockedDates(),
      bookingClient.getCatalog(),
    ]);
    setBusinessHours(bh);
    setHolidays(hol);
    setBlockedDates(blocked);
    setCatalog(cat);
  }
  useEffect(() => {
    refresh();
  }, []);

  function dayFor(wd: Weekday): BusinessHourInput {
    return businessHours.find((b) => b.weekday === wd) ?? { weekday: wd, isOpen: false, startTime: "09:00", endTime: "18:00" };
  }

  async function saveDay(wd: Weekday, patch: Partial<BusinessHourInput>) {
    const current = dayFor(wd);
    const updated = { ...current, ...patch };
    setBusinessHours((prev) => {
      const others = prev.filter((b) => b.weekday !== wd);
      return [...others, updated];
    });
    setSavingDay(wd);
    await bookingClient.setBusinessHours(updated);
    setSavingDay(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-charcoal">Horários</h1>
        <p className="mt-1 text-sm text-charcoal-soft">Configure o funcionamento do espaço, feriados e bloqueios.</p>
      </div>

      <section className="card-ivy p-5 sm:p-6">
        <h2 className="font-display text-lg text-charcoal">Horário de funcionamento</h2>
        <div className="mt-4 space-y-2">
          {WEEKDAY_ORDER.map((wd) => {
            const d = dayFor(wd);
            return (
              <div key={wd} className="flex flex-wrap items-center gap-3 rounded-xl bg-blush-soft/60 p-3">
                <label className="flex w-36 shrink-0 items-center gap-2 text-sm font-medium text-charcoal">
                  <input type="checkbox" checked={d.isOpen} onChange={(e) => saveDay(wd, { isOpen: e.target.checked })} />
                  {WEEKDAY_LABEL[wd]}
                </label>
                {d.isOpen && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <input type="time" value={d.startTime} onChange={(e) => saveDay(wd, { startTime: e.target.value })} className="rounded-lg border border-charcoal/15 px-2 py-1.5" />
                    <span className="text-charcoal-soft">até</span>
                    <input type="time" value={d.endTime} onChange={(e) => saveDay(wd, { endTime: e.target.value })} className="rounded-lg border border-charcoal/15 px-2 py-1.5" />
                    <span className="ml-2 text-charcoal-soft">Intervalo:</span>
                    <input type="time" value={d.breakStart ?? ""} onChange={(e) => saveDay(wd, { breakStart: e.target.value })} className="rounded-lg border border-charcoal/15 px-2 py-1.5" />
                    <span className="text-charcoal-soft">até</span>
                    <input type="time" value={d.breakEnd ?? ""} onChange={(e) => saveDay(wd, { breakEnd: e.target.value })} className="rounded-lg border border-charcoal/15 px-2 py-1.5" />
                  </div>
                )}
                {savingDay === wd && <span className="text-xs text-charcoal-soft">Salvando...</span>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card-ivy p-5 sm:p-6">
        <h2 className="font-display text-lg text-charcoal">Feriados</h2>
        <HolidayForm onAdd={async (date, name) => { await bookingClient.addHoliday(date, name); refresh(); }} />
        <ul className="mt-4 divide-y divide-charcoal/10">
          {holidays.map((h) => (
            <li key={h.id} className="flex items-center justify-between py-2.5 text-sm">
              <span>{formatDateShort(h.date)} — {h.name}</span>
              <button onClick={async () => { await bookingClient.removeHoliday(h.id); refresh(); }} className="rounded-lg p-1.5 text-rose-deep hover:bg-blush-soft">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
          {holidays.length === 0 && <p className="py-2 text-sm text-charcoal-soft">Nenhum feriado cadastrado.</p>}
        </ul>
      </section>

      <section className="card-ivy p-5 sm:p-6">
        <h2 className="font-display text-lg text-charcoal">Bloqueios específicos</h2>
        <p className="mt-1 text-xs text-charcoal-soft">Bloqueie uma data para todo o espaço, ou apenas para uma profissional (folga).</p>
        <BlockedDateForm
          professionals={catalog?.professionals ?? []}
          onAdd={async (professionalId, date, reason) => {
            await bookingClient.addBlockedDate(professionalId, date, reason);
            refresh();
          }}
        />
        <ul className="mt-4 divide-y divide-charcoal/10">
          {blockedDates.map((b) => (
            <li key={b.id} className="flex items-center justify-between py-2.5 text-sm">
              <span>
                {formatDateShort(b.date)} — {b.professionalId ? catalog?.professionals.find((p) => p.id === b.professionalId)?.name ?? "Profissional" : "Espaço todo"}
                {b.reason ? ` (${b.reason})` : ""}
              </span>
              <button onClick={async () => { await bookingClient.removeBlockedDate(b.id); refresh(); }} className="rounded-lg p-1.5 text-rose-deep hover:bg-blush-soft">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
          {blockedDates.length === 0 && <p className="py-2 text-sm text-charcoal-soft">Nenhum bloqueio cadastrado.</p>}
        </ul>
      </section>
    </div>
  );
}

function HolidayForm({ onAdd }: { onAdd: (date: string, name: string) => Promise<void> }) {
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!date || !name) return;
        await onAdd(date, name);
        setDate("");
        setName("");
      }}
      className="mt-3 flex flex-wrap gap-2"
    >
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="rounded-lg border border-charcoal/15 px-3 py-2 text-sm" />
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do feriado" required className="flex-1 rounded-lg border border-charcoal/15 px-3 py-2 text-sm" />
      <button type="submit" className="flex items-center gap-1 rounded-lg bg-rose-deep px-3 py-2 text-sm text-white">
        <Plus size={14} /> Adicionar
      </button>
    </form>
  );
}

function BlockedDateForm({
  professionals,
  onAdd,
}: {
  professionals: Catalog["professionals"];
  onAdd: (professionalId: string | null, date: string, reason?: string) => Promise<void>;
}) {
  const [date, setDate] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [reason, setReason] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!date) return;
        await onAdd(professionalId || null, date, reason || undefined);
        setDate("");
        setReason("");
      }}
      className="mt-3 flex flex-wrap gap-2"
    >
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="rounded-lg border border-charcoal/15 px-3 py-2 text-sm" />
      <select value={professionalId} onChange={(e) => setProfessionalId(e.target.value)} className="rounded-lg border border-charcoal/15 px-3 py-2 text-sm">
        <option value="">Espaço todo</option>
        {professionals.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo (opcional)" className="flex-1 rounded-lg border border-charcoal/15 px-3 py-2 text-sm" />
      <button type="submit" className="flex items-center gap-1 rounded-lg bg-rose-deep px-3 py-2 text-sm text-white">
        <Plus size={14} /> Bloquear
      </button>
    </form>
  );
}
