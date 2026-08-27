"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Power } from "lucide-react";
import { bookingClient } from "@/lib/booking-client";
import type { Catalog, CatalogService } from "@/lib/types";
import Modal from "@/components/admin/Modal";
import { formatBRL, formatDuration, slugify } from "@/lib/format";

export default function ServicesPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [editing, setEditing] = useState<CatalogService | "new" | null>(null);

  async function refresh() {
    setCatalog(await bookingClient.getCatalog());
  }
  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal">Serviços</h1>
          <p className="mt-1 text-sm text-charcoal-soft">Gerencie o catálogo de serviços do salão.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary !py-2.5 text-sm">
          <Plus size={16} /> Novo serviço
        </button>
      </div>

      <div className="card-ivy mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-charcoal/10 text-xs uppercase tracking-wide text-charcoal-soft">
            <tr>
              <th className="px-5 py-3">Serviço</th>
              <th className="px-5 py-3">Categoria</th>
              <th className="px-5 py-3">Duração</th>
              <th className="px-5 py-3">Preço</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {catalog && catalog.services.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-charcoal-soft">Nenhum serviço cadastrado.</td></tr>
            )}
            {catalog?.services.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-3 font-medium text-charcoal">{s.name}</td>
                <td className="px-5 py-3 text-charcoal-soft">{s.categoryName}</td>
                <td className="px-5 py-3 text-charcoal-soft">{formatDuration(s.duration)}</td>
                <td className="px-5 py-3 text-charcoal-soft">{formatBRL(s.price)}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${s.active ? "bg-sage/25 text-charcoal" : "bg-charcoal/10 text-charcoal-soft"}`}>
                    {s.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={async () => {
                        await bookingClient.updateService(s.id, { active: !s.active });
                        refresh();
                      }}
                      className="rounded-lg p-2 hover:bg-blush-soft"
                      aria-label="Ativar/desativar"
                      title="Ativar/desativar"
                    >
                      <Power size={16} />
                    </button>
                    <button onClick={() => setEditing(s)} className="rounded-lg p-2 hover:bg-blush-soft" aria-label="Editar">
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Excluir o serviço "${s.name}"?`)) {
                          await bookingClient.deleteService(s.id);
                          refresh();
                        }
                      }}
                      className="rounded-lg p-2 text-rose-deep hover:bg-blush-soft"
                      aria-label="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && catalog && (
        <ServiceFormModal
          service={editing === "new" ? null : editing}
          catalog={catalog}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function ServiceFormModal({
  service,
  catalog,
  onClose,
  onSaved,
}: {
  service: CatalogService | null;
  catalog: Catalog;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(service?.name ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [categoryId, setCategoryId] = useState(service?.categoryId ?? catalog.categories[0]?.id ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [benefits, setBenefits] = useState(service?.benefits ?? "");
  const [importantInfo, setImportantInfo] = useState(service?.importantInfo ?? "");
  const [duration, setDuration] = useState(service?.duration ?? 60);
  const [price, setPrice] = useState(service?.price ?? 0);
  const [image, setImage] = useState(service?.image ?? "/images/placeholders/svc-spa-1.png");
  const [professionalIds, setProfessionalIds] = useState<string[]>(service?.professionalIds ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleProfessional(id: string) {
    setProfessionalIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const finalSlug = slug.trim() || slugify(name);
    const data = {
      categoryId,
      name,
      slug: finalSlug,
      description,
      benefits,
      importantInfo,
      duration: Number(duration),
      price: Number(price),
      image,
      professionalIds,
    };
    const res = service ? await bookingClient.updateService(service.id, data) : await bookingClient.createService(data);
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSaved();
  }

  return (
    <Modal title={service ? "Editar serviço" : "Novo serviço"} onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-charcoal">Nome</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!service) setSlug(slugify(e.target.value));
              }}
              required
              className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Categoria</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep">
              {catalog.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-charcoal">Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} required className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep" />
        </div>
        <div>
          <label className="text-sm font-medium text-charcoal">Benefícios</label>
          <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={2} className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep" />
        </div>
        <div>
          <label className="text-sm font-medium text-charcoal">Informações importantes</label>
          <textarea value={importantInfo} onChange={(e) => setImportantInfo(e.target.value)} rows={2} className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-charcoal">Duração (min)</label>
            <input type="number" min={5} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} required className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep" />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Preço (R$)</label>
            <input type="number" min={0} step={1} value={price} onChange={(e) => setPrice(Number(e.target.value))} required className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep" />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Imagem (caminho)</label>
            <input value={image} onChange={(e) => setImage(e.target.value)} className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-charcoal">Profissionais que realizam este serviço</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {catalog.professionals.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => toggleProfessional(p.id)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  professionalIds.includes(p.id) ? "bg-rose-deep text-white" : "bg-blush-soft text-charcoal"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-rose-deep">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </Modal>
  );
}
