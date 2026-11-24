"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Loader2, Star, Trash2, ImagePlus, X, AlertCircle } from "lucide-react";
import type { DestinationPhoto } from "@/types/destination";
import { MAX_GALLERY_IMAGES, ACCEPTED_IMAGE_TYPES } from "@/lib/media";
import { uploadImage } from "./image-uploader";
import {
  addDestinationImageAction,
  deleteDestinationImageAction,
  moveImageAction,
  setCoverImageAction,
  updateImageCaptionAction,
} from "@/server/actions/media-actions";
import type { ActionResult } from "@/server/actions/cms-actions";

/** Galeri destinasi. Data `images` datang dari server; tiap aksi me-revalidate sehingga props ikut segar. */
export function GalleryManager({
  destinationId,
  destinationName,
  images,
  onClose,
}: {
  destinationId: string;
  destinationName: string;
  images: DestinationPhoto[];
  onClose: () => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const remaining = MAX_GALLERY_IMAGES - images.length;

  const run = (p: () => Promise<ActionResult>) => {
    setError("");
    startTransition(async () => {
      const r = await p();
      if (!r.success) setError(r.error);
    });
  };

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, Math.max(0, remaining));
    e.target.value = "";
    if (!files.length) return;
    setError("");
    setBusy(true);
    const failed: string[] = [];
    for (const f of files) {
      try {
        const url = await uploadImage(f, "destinasi", destinationId);
        const r = await addDestinationImageAction(destinationId, url);
        if (!r.success) failed.push(`${f.name}: ${r.error}`);
      } catch (err) {
        failed.push(`${f.name}: ${err instanceof Error ? err.message : "gagal"}`);
      }
    }
    setBusy(false);
    if (failed.length) setError(failed.join(" • "));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-heading font-bold text-base text-stone-900">Galeri Foto</h3>
            <p className="text-xs text-stone-500">{destinationName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-stone-400 hover:text-stone-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500">
            {images.length}/{MAX_GALLERY_IMAGES} foto • foto bertanda ★ menjadi sampul
          </span>
          <button
            type="button"
            disabled={busy || remaining <= 0}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-800 text-white font-semibold hover:bg-primary-900 disabled:opacity-50 cursor-pointer"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
            {busy ? "Mengunggah..." : "Tambah Foto"}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={onFiles}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {images.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-10">
            Belum ada foto. Halaman publik memakai gradient placeholder sampai foto diunggah.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {images.map((img, i) => (
              <li key={img.id} className="rounded-xl border border-stone-200 overflow-hidden bg-white">
                <div className="relative h-36 bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                  {img.isCover && (
                    <span className="absolute top-2 left-2 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded">
                      ★ SAMPUL
                    </span>
                  )}
                </div>
                <div className="p-2.5 space-y-2 text-xs">
                  <CaptionInput
                    key={img.id + img.caption}
                    initial={img.caption}
                    onSave={(c) => run(() => updateImageCaptionAction(img.id, c))}
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={pending || img.isCover}
                      onClick={() => run(() => setCoverImageAction(img.id))}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-stone-200 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" /> Jadikan sampul
                    </button>
                    <button
                      type="button"
                      aria-label="Naikkan"
                      disabled={pending || i === 0}
                      onClick={() => run(() => moveImageAction(img.id, "up"))}
                      className="p-1.5 rounded-md border border-stone-200 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Turunkan"
                      disabled={pending || i === images.length - 1}
                      onClick={() => run(() => moveImageAction(img.id, "down"))}
                      className="p-1.5 rounded-md border border-stone-200 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Hapus foto"
                      disabled={pending}
                      onClick={() => confirm("Hapus foto ini?") && run(() => deleteDestinationImageAction(img.id))}
                      className="ml-auto p-1.5 rounded-md text-rose-600 hover:bg-rose-50 disabled:opacity-40 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CaptionInput({ initial, onSave }: { initial: string; onSave: (c: string) => void }) {
  const [v, setV] = React.useState(initial);
  return (
    <input
      type="text"
      value={v}
      maxLength={200}
      placeholder="Keterangan foto (opsional)"
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v.trim() !== initial && onSave(v)}
      className="w-full px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:border-primary-800"
    />
  );
}
