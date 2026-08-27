"use client";

import { useEffect, useState } from "react";
import { bookingClient } from "@/lib/booking-client";
import type { CustomerRecord } from "@/lib/types";
import { formatDateShort } from "@/lib/format";
import { whatsappLink, generalInquiryMessage } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export default function ClientsPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    bookingClient.listCustomersAdmin().then((c) => {
      setCustomers(c);
      setLoading(false);
    });
  }, []);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.whatsapp.includes(query)
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal">Clientes</h1>
          <p className="mt-1 text-sm text-charcoal-soft">Histórico de clientes que já agendaram pelo site.</p>
        </div>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nome ou WhatsApp..."
        className="mt-4 w-full max-w-sm rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep"
      />

      <div className="card-ivy mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wide text-charcoal-soft">
            <tr>
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">WhatsApp</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Atendimentos</th>
              <th className="px-5 py-3">Último atendimento</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-charcoal-soft">Nenhum cliente encontrado.</td></tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3 font-medium text-charcoal">{c.name}</td>
                <td className="px-5 py-3 text-charcoal-soft">{c.whatsapp}</td>
                <td className="px-5 py-3 text-charcoal-soft">{c.email || "—"}</td>
                <td className="px-5 py-3 text-charcoal-soft">{c.totalAppointments}</td>
                <td className="px-5 py-3 text-charcoal-soft">{c.lastAppointmentDate ? formatDateShort(c.lastAppointmentDate) : "—"}</td>
                <td className="px-5 py-3 text-right">
                  <a
                    href={whatsappLink(generalInquiryMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blush-soft px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-blush"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
