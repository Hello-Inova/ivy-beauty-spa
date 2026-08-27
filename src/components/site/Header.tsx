"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { withBasePath } from "@/lib/demo-mode";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre" },
  { href: "/galeria", label: "Galeria" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/5 bg-cream/90 backdrop-blur-md">
      <div className="container-ivy flex h-18 items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBasePath("/images/logo.png")} alt="Ivy Beauty e Spa" className="h-10 w-auto sm:h-11" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition-colors ${
                  active ? "text-rose-deep font-medium" : "text-charcoal/80 hover:text-rose-deep"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link href="/agendamento" className="btn-primary">
            Agendar agora
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-charcoal/5 bg-cream md:hidden">
          <nav className="container-ivy flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-3 text-base ${
                  pathname === link.href ? "bg-blush-soft text-rose-deep font-medium" : "text-charcoal"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/agendamento" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full">
              Agendar agora
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
