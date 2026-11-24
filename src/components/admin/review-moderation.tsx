"use client";

import * as React from "react";
import { Check, X, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { approveReviewAction, deleteReviewAction } from "@/server/actions/content-actions";
import type { ActionResult } from "@/server/actions/cms-actions";

export interface ModerationReview {
  id: string;
  destination: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  approved: boolean;
}

export function ReviewModeration({ reviews }: { reviews: ModerationReview[] }) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState("");

  const run = (p: Promise<ActionResult>) => {
    setError("");
    startTransition(async () => {
      const res = await p;
      if (!res.success) setError(res.error);
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-5">
        <Badge variant="primary" className="mb-1 text-[11px]">
          Layanan Interaktif
        </Badge>
        <h1 className="font-editorial text-3xl font-bold text-primary-950">
          Moderasi Ulasan & Aspirasi Pengunjung
        </h1>
        <p className="text-xs text-stone-500 font-body">
          Setujui atau tolak ulasan yang dikirimkan pengunjung sebelum ditampilkan di portal publik.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">{error}</div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 && (
          <p className="text-xs text-stone-400 text-center py-10">Belum ada ulasan.</p>
        )}
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-[10px]">
                  {rev.destination}
                </Badge>
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-stone-400">• {rev.date}</span>
              </div>

              <p className="font-heading font-semibold text-sm text-stone-900">
                {rev.author}
              </p>

              <p className="text-xs text-stone-600 font-body leading-relaxed">
                &quot;{rev.comment}&quot;
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {rev.approved ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
                  ✓ Disetujui
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(approveReviewAction(rev.id))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => confirm("Tolak dan hapus ulasan ini?") && run(deleteReviewAction(rev.id))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
