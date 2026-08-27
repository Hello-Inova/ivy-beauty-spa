"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, CalendarRange, CalendarDays, Wallet } from "lucide-react";
import { bookingClient } from "@/lib/booking-client";
import type { DashboardStats } from "@/lib/types";
import { formatBRL } from "@/lib/format";

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="card-ivy p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blush-soft text-rose-deep">
          <Icon size={20} />
        </span>
        <div>
          <p className="text-xs text-charcoal-soft">{label}</p>
          <p className="font-display text-2xl text-charcoal">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-charcoal">{label}</span>
        <span className="text-charcoal-soft">{count}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-blush-soft">
        <div className="h-full rounded-full bg-rose-deep" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    bookingClient.getDashboardStats().then(setStats);
  }, []);

  if (!stats) return <p className="text-charcoal-soft">Carregando...</p>;

  const maxService = Math.max(1, ...stats.topServices.map((s) => s.count));
  const maxProf = Math.max(1, ...stats.topProfessionals.map((s) => s.count));

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal">Dashboard</h1>
      <p className="mt-1 text-sm text-charcoal-soft">Visão geral dos agendamentos e desempenho.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Hoje" value={stats.todayCount} />
        <StatCard icon={CalendarRange} label="Esta semana" value={stats.weekCount} />
        <StatCard icon={CalendarDays} label="Este mês" value={stats.monthCount} />
        <StatCard icon={Wallet} label="Receita estimada (mês)" value={formatBRL(stats.monthRevenue)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-ivy p-6">
          <h2 className="font-display text-lg text-charcoal">Serviços mais agendados</h2>
          <div className="mt-4 space-y-3">
            {stats.topServices.length === 0 && <p className="text-sm text-charcoal-soft">Sem dados ainda.</p>}
            {stats.topServices.map((s) => (
              <Bar key={s.name} label={s.name} count={s.count} max={maxService} />
            ))}
          </div>
        </div>

        <div className="card-ivy p-6">
          <h2 className="font-display text-lg text-charcoal">Profissionais com mais agendamentos</h2>
          <div className="mt-4 space-y-3">
            {stats.topProfessionals.length === 0 && <p className="text-sm text-charcoal-soft">Sem dados ainda.</p>}
            {stats.topProfessionals.map((s) => (
              <Bar key={s.name} label={s.name} count={s.count} max={maxProf} />
            ))}
          </div>
        </div>
      </div>

      <div className="card-ivy mt-6 p-6">
        <h2 className="font-display text-lg text-charcoal">Clientes recentes</h2>
        <div className="mt-4 divide-y divide-charcoal/10">
          {stats.recentCustomers.length === 0 && <p className="py-2 text-sm text-charcoal-soft">Nenhum cliente ainda.</p>}
          {stats.recentCustomers.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-charcoal">{c.name}</span>
              <span className="text-charcoal-soft">{c.whatsapp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
