/**
 * Motor de disponibilidade — funções puras, sem dependência de banco de
 * dados ou de framework, usadas tanto pelo modo completo (API routes +
 * Postgres) quanto pelo modo demonstração (localStorage no navegador).
 *
 * Regras implementadas (ver spec, seção 16):
 *  - respeita o horário de funcionamento do espaço;
 *  - respeita o horário de trabalho da profissional naquele dia da semana;
 *  - respeita o intervalo (almoço) da profissional;
 *  - respeita datas bloqueadas (feriados e bloqueios específicos);
 *  - considera a duração do serviço;
 *  - nunca sobrepõe agendamentos já existentes;
 *  - nunca permite horários no passado.
 */

import type { BusinessHourEntry, WorkingHourEntry, Weekday } from "./types";
import { WEEKDAY_ORDER } from "@/data/seed-data";

export const SLOT_STEP_MINUTES = 30;

export function weekdayForDate(dateStr: string): Weekday {
  // dateStr: "YYYY-MM-DD". Parsed as UTC midnight so the weekday is stable
  // regardless of the server/browser's local timezone.
  const d = new Date(`${dateStr}T00:00:00Z`);
  return WEEKDAY_ORDER[d.getUTCDay()];
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

interface ExistingSlot {
  startTime: string;
  endTime: string;
}

export interface ComputeSlotsParams {
  date: string; // "YYYY-MM-DD"
  durationMinutes: number;
  businessHours: BusinessHourEntry[];
  professionalWorkingHours: WorkingHourEntry[]; // all entries for the professional (any weekday)
  blockedDates: string[]; // dates (YYYY-MM-DD) blocked for this professional or the whole business
  existingAppointments: ExistingSlot[]; // this professional's active appointments on `date`
  /** Minutes-since-midnight "now" — only relevant when `date` is today. Pass null/undefined to disable past-time filtering (e.g. when computing for a future date). */
  nowMinutes?: number | null;
  /** Minimum lead time in minutes required before a slot can be booked today (default 0). */
  minLeadMinutes?: number;
}

export function computeAvailableSlots(params: ComputeSlotsParams): string[] {
  const {
    date,
    durationMinutes,
    businessHours,
    professionalWorkingHours,
    blockedDates,
    existingAppointments,
    nowMinutes,
    minLeadMinutes = 0,
  } = params;

  if (blockedDates.includes(date)) return [];

  const weekday = weekdayForDate(date);

  const business = businessHours.find((b) => b.weekday === weekday);
  if (!business || !business.isOpen) return [];

  const working = professionalWorkingHours.find((w) => w.weekday === weekday);
  if (!working) return [];

  // Effective window = intersection of business hours and professional's working hours.
  const windowStart = Math.max(
    timeToMinutes(business.startTime),
    timeToMinutes(working.startTime)
  );
  const windowEnd = Math.min(
    timeToMinutes(business.endTime),
    timeToMinutes(working.endTime)
  );

  if (windowEnd - windowStart < durationMinutes) return [];

  const breaks: { start: number; end: number }[] = [];
  if (business.breakStart && business.breakEnd) {
    breaks.push({
      start: timeToMinutes(business.breakStart),
      end: timeToMinutes(business.breakEnd),
    });
  }
  if (working.breakStart && working.breakEnd) {
    breaks.push({
      start: timeToMinutes(working.breakStart),
      end: timeToMinutes(working.breakEnd),
    });
  }

  const busy = existingAppointments.map((a) => ({
    start: timeToMinutes(a.startTime),
    end: timeToMinutes(a.endTime),
  }));

  const slots: string[] = [];
  const earliestAllowed =
    typeof nowMinutes === "number" ? nowMinutes + minLeadMinutes : -Infinity;

  for (
    let start = windowStart;
    start + durationMinutes <= windowEnd;
    start += SLOT_STEP_MINUTES
  ) {
    const end = start + durationMinutes;

    if (start < earliestAllowed) continue;

    const overlapsBreak = breaks.some((b) => start < b.end && end > b.start);
    if (overlapsBreak) continue;

    const overlapsBusy = busy.some((b) => start < b.end && end > b.start);
    if (overlapsBusy) continue;

    slots.push(minutesToTime(start));
  }

  return slots;
}

/** True if the professional works at all on this weekday (used to grey out calendar days). */
export function professionalWorksOnDate(
  date: string,
  businessHours: BusinessHourEntry[],
  professionalWorkingHours: WorkingHourEntry[],
  blockedDates: string[]
): boolean {
  if (blockedDates.includes(date)) return false;
  const weekday = weekdayForDate(date);
  const business = businessHours.find((b) => b.weekday === weekday);
  if (!business || !business.isOpen) return false;
  return professionalWorkingHours.some((w) => w.weekday === weekday);
}

export function todayISO(timeZone = "America/Sao_Paulo"): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // en-CA => YYYY-MM-DD
}

export function nowMinutesInTZ(timeZone = "America/Sao_Paulo"): number {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}
