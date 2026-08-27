"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { withBasePath } from "@/lib/demo-mode";

/**
 * Replaces the old "cole o caminho da imagem" text input across the admin
 * panel with a real "anexar imagem" (attach image) button. The file is
 * resized/compressed client-side and stored as a base64 data URL — this
 * works identically in demo mode (localStorage) and in full/server mode
 * (Postgres), since it's just a string in either case, with no separate
 * file-upload server needed.
 */
async function fileToCompressedDataUrl(file: File, maxDim = 1000, quality = 0.8): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("sem contexto 2d");
    ctx.drawImage(bitmap, 0, 0, w, h);
    const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
    return canvas.toDataURL(mime, quality);
  } catch {
    // Fallback (e.g. SVG or a format createImageBitmap can't handle): keep the original file as-is.
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

export default function ImageUploadField({
  value,
  onChange,
  label,
  aspect = "aspect-square",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("Não foi possível processar essa imagem.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewSrc = value ? (value.startsWith("data:") ? value : withBasePath(value)) : null;

  return (
    <div>
      {label && <label className="text-sm font-medium text-charcoal">{label}</label>}
      <div className="mt-1.5 flex items-start gap-3">
        <div className={`relative ${aspect} w-20 shrink-0 overflow-hidden rounded-xl bg-blush-soft`}>
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary data: URLs from admin uploads, not a static asset next/image can optimize
            <img src={previewSrc} alt="Pré-visualização" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-charcoal-soft">
              <ImagePlus size={18} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blush-soft px-3 py-2 text-xs font-medium text-charcoal hover:bg-blush disabled:opacity-60"
            >
              <ImagePlus size={14} /> {busy ? "Processando..." : value ? "Trocar imagem" : "Anexar imagem"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blush-soft px-2.5 py-2 text-xs font-medium text-rose-deep hover:bg-blush"
                aria-label="Remover imagem"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowUrlField((s) => !s)}
            className="text-xs text-charcoal-soft underline underline-offset-2 hover:text-rose-deep"
          >
            {showUrlField ? "ocultar link avançado" : "usar um link em vez de anexar"}
          </button>
          {showUrlField && (
            <input
              value={value.startsWith("data:") ? "" : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/images/placeholders/... ou https://..."
              className="w-full rounded-xl border border-charcoal/15 px-3 py-2 text-xs outline-none focus:border-rose-deep"
            />
          )}
          {error && <p className="text-xs text-rose-deep">{error}</p>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}
