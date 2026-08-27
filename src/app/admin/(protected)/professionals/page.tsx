"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Power, Clock } from "lucide-react";
import { bookingClient } from "@/lib/booking-client";
import type { WorkingHourInput } from "@/lib/booking-client";
import type { Catalog, CatalogProfessional, Weekday } from "@/lib/types";
import { WEEKDAY_ORDER, WEEKDAY_LABEL } from "@/data/seed-data";
import Modal from "@/components/admin/Modal";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { withBasePath } from "@/lib/demo-mode";

export default function ProfessionalsPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [editing, setEditing] = useState<CatalogProfessional | "new" | null>(null);
  const [editingHours, setEditingHours] = useState<CatalogProfessional | null>(null);

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
          <h1 className="font-display text-2xl text-charcoal">Profissionais</h1>
          <p className="mt-1 text-sm text-charcoal-soft">Gerencie a equipe e os horários de trabalho.</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary !py-2.5 text-sm">
          <Plus size={16} /> Nova profissional
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog?.professionals.map((p) => (
          <div key={p.id} className="card-ivy p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                <Image src={withBasePath(p.photo || "/images/placeholders/pro-1.png")} alt={p.name} fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base text-charcoal">{p.name}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${p.active ? "bg-sage/25 text-charcoal" : "bg-charcoal/10 text-charcoal-soft"}`}>
                  {p.active ? "Ativa" : "Inativa"}
                </span>
              </div>
            </div>
            {p.description && <p className="mt-3 line-clamp-2 text-xs text-charcoal-soft">{p.description}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditingHours(p)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blush-soft py-2 text-xs font-medium text-charcoal hover:bg-blush">
                <Clock size={14} /> Horários
              </button>
              <button onClick={() => setEditing(p)} className="rounded-xl bg-blush-soft p-2 hover:bg-blush" aria-label="Editar">
                <Pencil size={16} />
              </button>
              <button
                onClick={async () => {
                  await bookingClient.updateProfessional(p.id, { active: !p.active });
                  refresh();
                }}
                className="rounded-xl bg-blush-soft p-2 hover:bg-blush"
                aria-label="Ativar/desativar"
              >
                <Power size={16} />
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Excluir "${p.name}"?`)) {
                    await bookingClient.deleteProfessional(p.id);
                    refresh();
                  }
                }}
                className="rounded-xl bg-blush-soft p-2 text-rose-deep hover:bg-blush"
                aria-label="Excluir"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProfessionalFormModal
          professional={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}

      {editingHours && (
        <WorkingHoursModal
          professional={editingHours}
          onClose={() => setEditingHours(null)}
          onSaved={() => {
            setEditingHours(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function ProfessionalFormModal({
  professional,
  onClose,
  onSaved,
}: {
  professional: CatalogProfessional | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(professional?.name ?? "");
  const [description, setDescription] = useState(professional?.description ?? "");
  const [photo, setPhoto] = useState(professional?.photo ?? "/images/placeholders/pro-1.png");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = professional
      ? await bookingClient.updateProfessional(professional.id, { name, description, photo })
      : await bookingClient.createProfessional({ name, description, photo });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSaved();
  }

  return (
    <Modal title={professional ? "Editar profissional" : "Nova profissional"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-charcoal">Nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep" />
        </div>
        <div>
          <label className="text-sm font-medium text-charcoal">Especialidades / descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-rose-deep" />
        </div>
        <ImageUploadField label="Foto" value={photo} onChange={setPhoto} aspect="aspect-square" />
        {error && <p className="text-sm text-rose-deep">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </Modal>
  );
}

function WorkingHoursModal({
  professional,
  onClose,
  onSaved,
}: {
  professional: CatalogProfessional;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initial = new Map(professional.workingHours.map((w) => [w.weekday, w]));
  const [days, setDays] = useState<Record<Weekday, { active: boolean; startTime: string; endTime: string; breakStart: string; breakEnd: string }>>(
    () =>
      Object.fromEntries(
        WEEKDAY_ORDER.map((wd) => {
          const existing = initial.get(wd);
          return [
            wd,
            {
              active: !!existing,
              startTime: existing?.startTime ?? "09:00",
              endTime: existing?.endTime ?? "18:00",
              breakStart: existing?.breakStart ?? "",
              breakEnd: existing?.breakEnd ?? "",
            },
          ];
        })
      ) as Record<Weekday, { active: boolean; startTime: string; endTime: string; breakStart: string; breakEnd: string }>
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const hours: WorkingHourInput[] = WEEKDAY_ORDER.filter((wd) => days[wd].active).map((wd) => ({
      weekday: wd,
      startTime: days[wd].startTime,
      endTime: days[wd].endTime,
      breakStart: days[wd].breakStart || undefined,
      breakEnd: days[wd].breakEnd || undefined,
    }));
    await bookingClient.setWorkingHours(professional.id, hours);
    setSaving(false);
    onSaved();
  }

  return (
    <Modal title={`Horários de ${professional.name}`} onClose={onClose} wide>
      <div className="space-y-3">
        {WEEKDAY_ORDER.map((wd) => (
          <div key={wd} className="flex flex-wrap items-center gap-3 rounded-xl bg-blush-soft/60 p-3">
            <label className="flex w-36 shrink-0 items-center gap-2 text-sm font-medium text-charcoal">
              <input
                type="checkbox"
                checked={days[wd].active}
                onChange={(e) => setDays((d) => ({ ...d, [wd]: { ...d[wd], active: e.target.checked } }))}
              />
              {WEEKDAY_LABEL[wd]}
            </label>
            {days[wd].active && (
              <div className="flex flex-1 flex-wrap items-center gap-2 text-sm">
                <input type="time" value={days[wd].startTime} onChange={(e) => setDays((d) => ({ ...d, [wd]: { ...d[wd], startTime: e.target.value } }))} className="rounded-lg border border-charcoal/15 px-2 py-1.5" />
                <span className="text-charcoal-soft">até</span>
                <input type="time" value={days[wd].endTime} onChange={(e) => setDays((d) => ({ ...d, [wd]: { ...d[wd], endTime: e.target.value } }))} className="rounded-lg border border-charcoal/15 px-2 py-1.5" />
                <span className="ml-2 text-charcoal-soft">Intervalo:</span>
                <input type="time" value={days[wd].breakStart} onChange={(e) => setDays((d) => ({ ...d, [wd]: { ...d[wd], breakStart: e.target.value } }))} className="rounded-lg border border-charcoal/15 px-2 py-1.5" />
                <span className="text-charcoal-soft">até</span>
                <input type="time" value={days[wd].breakEnd} onChange={(e) => setDays((d) => ({ ...d, [wd]: { ...d[wd], breakEnd: e.target.value } }))} className="rounded-lg border border-charcoal/15 px-2 py-1.5" />
              </div>
            )}
          </div>
        ))}
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          {saving ? "Salvando..." : "Salvar horários"}
        </button>
      </div>
    </Modal>
  );
}
