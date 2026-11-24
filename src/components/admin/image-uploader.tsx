"use client";

import * as React from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { createUploadUrlAction } from "@/server/actions/media-actions";
import { prepareImage, putToSignedUrl } from "@/lib/image-resize";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/media";

export type UploadScope = "destinasi" | "berita" | "kuliner" | "umkm" | "event" | "pengaturan";

/** Alur: resize -> minta URL upload ke server -> PUT langsung ke Supabase -> kembalikan URL publik. */
export async function uploadImage(file: File, scope: UploadScope, entityId?: string | null): Promise<string> {
  const blob = await prepareImage(file);
  const res = await createUploadUrlAction({ scope, entityId: entityId ?? null, mime: blob.type, size: blob.size });
  if (!res.success || !res.data) throw new Error(res.success ? "Gagal menyiapkan unggahan." : res.error);
  await putToSignedUrl(res.data.signedUrl, blob);
  return res.data.publicUrl;
}

export function ImageUploader({
  scope,
  entityId,
  value,
  onChange,
  label = "Foto",
}: {
  scope: UploadScope;
  entityId?: string | null;
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange(await uploadImage(file, scope, entityId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="block font-semibold text-stone-700 mb-1">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-24 h-16 rounded-lg border border-stone-200 bg-stone-100 overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-5 h-5 text-stone-400" />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 font-semibold hover:bg-stone-50 disabled:opacity-60 cursor-pointer"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
              {busy ? "Mengunggah..." : value ? "Ganti Foto" : "Pilih Foto"}
            </button>
            {value && !busy && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            )}
          </div>
          <p className="text-[11px] text-stone-400">JPG/PNG/WebP, otomatis diperkecil. Disimpan saat tombol Simpan ditekan.</p>
          {error && <p className="text-[11px] text-rose-600">{error}</p>}
        </div>
        <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} className="hidden" onChange={onFile} />
      </div>
    </div>
  );
}
