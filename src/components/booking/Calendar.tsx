"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

function toISO(y: number, m: number, d: number): string {
  return `${y}-${(m + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
}

export default function Calendar({
  selected,
  onSelect,
  isDateDisabled,
  minDate,
  maxMonthsAhead = 3,
}: {
  selected: string | null;
  onSelect: (dateISO: string) => void;
  isDateDisabled: (dateISO: string) => boolean;
  minDate: string; // "YYYY-MM-DD"
  maxMonthsAhead?: number;
}) {
  const [minY, minM] = minDate.split("-").map(Number);
  const [cursor, setCursor] = useState({ year: minY, month: minM - 1 });

  const firstOfMonth = new Date(Date.UTC(cursor.year, cursor.month, 1));
  const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
  const startWeekday = firstOfMonth.getUTCDay();

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthsFromMin =
    (cursor.year - minY) * 12 + (cursor.month - (minM - 1));
  const canGoBack = monthsFromMin > 0;
  const canGoForward = monthsFromMin < maxMonthsAhead;

  return (
    <div className="card-ivy p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={!canGoBack}
          onClick={() => setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal disabled:opacity-20 enabled:hover:bg-blush-soft"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-display text-base text-charcoal">
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </span>
        <button
          type="button"
          disabled={!canGoForward}
          onClick={() => setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal disabled:opacity-20 enabled:hover:bg-blush-soft"
          aria-label="Próximo mês"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-charcoal-soft">
        {WEEKDAY_SHORT.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} />;
          const iso = toISO(cursor.year, cursor.month, day);
          const disabled = iso < minDate || isDateDisabled(iso);
          const isSelected = selected === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(iso)}
              className={`aspect-square rounded-xl text-sm transition-colors ${
                isSelected
                  ? "bg-rose-deep text-white font-medium"
                  : disabled
                  ? "text-charcoal-soft/30 line-through"
                  : "text-charcoal hover:bg-blush-soft"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
