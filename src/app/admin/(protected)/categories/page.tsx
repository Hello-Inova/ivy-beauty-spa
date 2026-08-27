"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { bookingClient } from "@/lib/booking-client";
import type { CatalogCategory } from "@/lib/types";
import Modal from "@/components/admin/Modal";
import { slugify } from "@/lib/format";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CatalogCategory | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");

  async function refresh() {
    const catalog = await bookingClient.getCatalog();
    setCategories(catalog.categories.sort((a, b) => a.order - b.order));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = categories
    .filter((c) => (statusFilter === "active" ? c.active : statusFilter === "inactive" ? !c.active : true))
    .filter((c) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal">Categorias</h1>
          <p className="mt-1 text-sm text-charcoal-soft">Organize os serviços por categoria.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary !py-2.5 text-sm">
          <Plus size={16} /> Nova categoria
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou slug..."
          className="w-full max-w-sm rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-xl border border-charcoal/15 px-3 py-2.5 text-sm">
          <option value="">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
        </select>
      </div>

      <div className="card-ivy mt-6 max-h-[65vh] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-charcoal/10 bg-ivory text-xs uppercase tracking-wide text-charcoal-soft">
            <tr>
              <th className="px-5 py-3">Ordem</th>
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-charcoal-soft">Nenhuma categoria encontrada.</td></tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3 text-charcoal-soft">{c.order}</td>
                <td className="px-5 py-3 font-medium text-charcoal">{c.name}</td>
                <td className="px-5 py-3 text-charcoal-soft">{c.slug}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${c.active ? "bg-sage/25 text-charcoal" : "bg-charcoal/10 text-charcoal-soft"}`}>
                    {c.active ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(c)} className="rounded-lg p-2 hover:bg-blush-soft" aria-label="Editar">
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Excluir a categoria "${c.name}"?`)) {
                          await bookingClient.deleteCategory(c.id);
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

      {editing && (
        <CategoryFormModal
          category={editing === "new" ? null : editing}
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

function CategoryFormModal({
  category,
  onClose,
  onSaved,
}: {
  category: CatalogCategory | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [order, setOrder] = useState(category?.order ?? 1);
  const [active, setActive] = useState(category?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const finalSlug = slug.trim() || slugify(name);
    const res = category
      ? await bookingClient.updateCategory(category.id, { name, slug: finalSlug, description, order: Number(order), active })
      : await bookingClient.createCategory({ name, slug: finalSlug, description, order: Number(order) });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSaved();
  }

  return (
    <Modal title={category ? "Editar categoria" : "Nova categoria"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-charcoal">Nome</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!category) setSlug(slugify(e.target.value));
            }}
            required
            className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-charcoal">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep" />
        </div>
        <div>
          <label className="text-sm font-medium text-charcoal">Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-charcoal">Ordem</label>
            <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep" />
          </div>
          {category && (
            <label className="flex flex-1 items-center gap-2 pt-6 text-sm text-charcoal">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Ativa
            </label>
          )}
        </div>
        {error && <p className="text-sm text-rose-deep">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </Modal>
  );
}
