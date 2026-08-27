"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Tags,
  Users,
  CalendarDays,
  Clock,
  Contact,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { bookingClient } from "@/lib/booking-client";
import { resetDemoData } from "@/lib/booking-client/local-client";
import { IS_DEMO_MODE, withBasePath } from "@/lib/demo-mode";
import type { AdminSession } from "@/lib/types";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Serviços", icon: Sparkles },
  { href: "/admin/categories", label: "Categorias", icon: Tags },
  { href: "/admin/professionals", label: "Profissionais", icon: Users },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/hours", label: "Horários", icon: Clock },
  { href: "/admin/clients", label: "Clientes", icon: Contact },
];

export default function AdminShell({
  initialSession,
  children,
}: {
  initialSession: AdminSession | null;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<AdminSession | null>(initialSession);
  const [checked, setChecked] = useState(!IS_DEMO_MODE);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!IS_DEMO_MODE) return;
    bookingClient.getAdminSession().then((s) => {
      setSession(s);
      setChecked(true);
      if (!s) router.replace("/admin/login");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await bookingClient.adminLogout();
    router.replace("/admin/login");
    router.refresh();
  }

  if (!checked) {
    return <div className="flex min-h-screen items-center justify-center text-charcoal-soft">Carregando...</div>;
  }
  if (IS_DEMO_MODE && !session) {
    return null; // redirecting
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-charcoal/10 bg-ivory lg:flex">
        <SidebarContent pathname={pathname} onNavigate={() => {}} />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-charcoal/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ivory">
            <div className="flex justify-end p-3">
              <button onClick={() => setMenuOpen(false)} aria-label="Fechar menu" className="rounded-full p-2 hover:bg-blush-soft">
                <X size={20} />
              </button>
            </div>
            <SidebarContent pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-charcoal/10 bg-ivory px-4 py-3 sm:px-6">
          <button className="rounded-lg p-2 hover:bg-blush-soft lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBasePath("/images/logo.png")} alt="Ivy Beauty e Spa" className="h-8 w-auto lg:hidden" />
          <div className="hidden items-center gap-2 text-sm text-charcoal-soft lg:flex">
            <Link href="/" target="_blank" className="flex items-center gap-1.5 hover:text-rose-deep">
              Ver site público <ExternalLink size={13} />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-charcoal-soft sm:inline">{session?.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-charcoal-soft hover:bg-blush-soft hover:text-rose-deep">
              <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        <main className="flex-1 bg-cream-deep p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 px-6 py-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={withBasePath("/images/logo.png")} alt="Ivy Beauty e Spa" className="h-9 w-auto" />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-blush-soft font-medium text-rose-deep" : "text-charcoal-soft hover:bg-blush-soft/60 hover:text-charcoal"
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          );
        })}
      </nav>
      {IS_DEMO_MODE && (
        <div className="border-t border-charcoal/10 p-4">
          <p className="text-xs text-charcoal-soft">
            Modo demonstração: dados salvos no navegador.
          </p>
          <button
            onClick={() => {
              if (confirm("Restaurar todos os dados de demonstração? Isso apaga agendamentos, clientes e edições feitas no navegador.")) {
                resetDemoData();
                window.location.href = "/admin";
              }
            }}
            className="mt-2 text-xs font-medium text-rose-deep underline"
          >
            Restaurar dados de demonstração
          </button>
        </div>
      )}
    </>
  );
}
