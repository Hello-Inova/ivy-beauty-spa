"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, Clock3, UserX, CalendarClock } from "lucide-react";
import { bookingClient } from "@/lib/booking-client";
import type { AppointmentRecord, AppointmentStatus } from "@/lib/types";
import { formatBRL, formatDateShort } from "@/lib/format";
import { todayISO } from "@/lib/availability";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sage/30 text-charcoal",
  COMPLETED: "bg-charcoal/10 text-charcoal",
  CANCELLED: "bg-rose/15 text-rose-deep",
  NO_SHOW: "bg-rose/15 text-rose-deep",
};

function weekRange() {
  const today = todayISO();
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const start = new Date(dt);
  start.setUTCDate(start.getUTCDate() - dt.getUTCDay());
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "">("");
  const [range, setRange] = useState<"today" | "week" | "all">("week");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function refresh() {
    setLoading(true);
    const filters: Parameters<typeof bookingClient.listAppointmentsAdmin>[0] = {};
    if (statusFilter) filters.status = statusFilter;
    if (range === "today") {
      filters.from = todayISO();
      filters.to = todayISO();
    } else if (range === "week") {
      const { from, to } = weekRange();
      filters.from = from;
      filters.to = to;
    }
    const data = await bookingClient.listAppointmentsAdmin(filters);
    setAppointments(data);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, range]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? appointments.filter(
          (a) =>
            a.customerName.toLowerCase().includes(q) ||
            a.serviceName.toLowerCase().includes(q) ||
            a.professionalName.toLowerCase().includes(q) ||
            a.customerWhatsapp.includes(q) ||
            a.code.toLowerCase().includes(q)
        )
      : appointments;
    const map = new Map<string, AppointmentRecord[]>();
    for (const a of filtered) {
      if (!map.has(a.date)) map.set(a.date, []);
      map.get(a.date)!.push(a);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [appointments, query]);

  async function setStatus(id: string, status: AppointmentStatus) {
    await bookingClient.updateAppointmentStatus(id, status);
    refresh();
  }

  async function reschedule(a: AppointmentRecord) {
    const newDate = prompt("Nova data (AAAA-MM-DD):", a.date);
    if (!newDate) return;
    const newStart = prompt("Novo horário (HH:MM):", a.startTime);
    if (!newStart) return;
    const [h, m] = newStart.split(":").map(Number);
    const durationMin =
      (Number(a.endTime.split(":")[0]) * 60 + Number(a.endTime.split(":")[1])) -
      (Number(a.startTime.split(":")[0]) * 60 + Number(a.startTime.split(":")[1]));
    const endMinutes = h * 60 + m + durationMin;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;
    const res = await bookingClient.rescheduleAppointment(a.id, newDate, newStart, endTime);
    if (!res.ok) alert(res.error);
    refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-charcoal">Agenda</h1>
          <p className="mt-1 text-sm text-charcoal-soft">Confirme, cancele, reagende ou marque atendimentos como concluídos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, serviço, profissional..."
            className="w-full max-w-xs rounded-xl border border-charcoal/15 px-4 py-2 text-sm outline-none focus:border-rose-deep"
          />
          <select value={range} onChange={(e) => setRange(e.target.value as typeof range)} className="rounded-xl border border-charcoal/15 px-3 py-2 text-sm">
            <option value="today">Hoje</option>
            <option value="week">Esta semana</option>
            <option value="all">Todos</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | "")} className="rounded-xl border border-charcoal/15 px-3 py-2 text-sm">
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-charcoal-soft">Carregando...</p>
      ) : grouped.length === 0 ? (
        <p className="mt-8 text-charcoal-soft">Nenhum agendamento encontrado para este filtro.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-charcoal">
                <CalendarClock size={15} className="text-rose-deep" /> {formatDateShort(date)} {date === todayISO() && <span className="text-rose-deep">(hoje)</span>}
              </h2>
              <div className="card-ivy divide-y divide-charcoal/10">
                {items
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((a) => (
                    <div key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-base text-charcoal">{a.startTime}</span>
                          <span className="text-sm text-charcoal">{a.serviceName}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                        </div>
                        <p className="mt-1 text-xs text-charcoal-soft">
                          {a.customerName} · {a.customerWhatsapp} · {a.professionalName} · {formatBRL(a.priceAtBooking)} · {a.code}
                        </p>
                        {a.notes && <p className="mt-1 text-xs italic text-charcoal-soft">Obs: {a.notes}</p>}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {a.status !== "CONFIRMED" && a.status !== "COMPLETED" && (
                          <button onClick={() => setStatus(a.id, "CONFIRMED")} className="flex items-center gap-1 rounded-lg bg-sage/25 px-2.5 py-1.5 text-xs font-medium text-charcoal hover:bg-sage/40" title="Confirmar">
                            <CheckCircle2 size={14} /> Confirmar
                          </button>
                        )}
                        {a.status !== "COMPLETED" && (
                          <button onClick={() => setStatus(a.id, "COMPLETED")} className="flex items-center gap-1 rounded-lg bg-blush-soft px-2.5 py-1.5 text-xs font-medium text-charcoal hover:bg-blush" title="Concluído">
                            <Clock3 size={14} /> Concluído
                          </button>
                        )}
                        <button onClick={() => reschedule(a)} className="flex items-center gap-1 rounded-lg bg-blush-soft px-2.5 py-1.5 text-xs font-medium text-charcoal hover:bg-blush" title="Reagendar">
                          <CalendarClock size={14} /> Reagendar
                        </button>
                        {a.status !== "NO_SHOW" && (
                          <button onClick={() => setStatus(a.id, "NO_SHOW")} className="flex items-center gap-1 rounded-lg bg-rose/10 px-2.5 py-1.5 text-xs font-medium text-rose-deep hover:bg-rose/20" title="Não compareceu">
                            <UserX size={14} /> Não veio
                          </button>
                        )}
                        {a.status !== "CANCELLED" && (
                          <button onClick={() => setStatus(a.id, "CANCELLED")} className="flex items-center gap-1 rounded-lg bg-rose/10 px-2.5 py-1.5 text-xs font-medium text-rose-deep hover:bg-rose/20" title="Cancelar">
                            <XCircle size={14} /> Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
