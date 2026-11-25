"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, MapPin, Star, Trash2 } from "lucide-react";
import { CoverImage } from "@/components/ui/cover-image";
import { formatRupiah } from "@/lib/utils";
import { WishlistButton, useWishlist } from "./wishlist";

export interface SavedCandidate {
  slug: string;
  name: string;
  categoryLabel: string;
  district: string;
  summary: string;
  coverUrl: string | null;
  coverGradient: string;
  ticketWeekday: number;
  rating: number;
}

export function SavedDestinations({ all }: { all: SavedCandidate[] }) {
  const { list, clear } = useWishlist();
  const bySlug = React.useMemo(() => new Map(all.map((d) => [d.slug, d])), [all]);
  const items = list.map((s) => bySlug.get(s)).filter((d): d is SavedCandidate => !!d);

  return (
    <div className="space-y-16 pb-20">
      <section className="relative overflow-hidden bg-primary-950 text-white pt-28 pb-24 sm:pt-32 sm:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-teal-950/80 opacity-95" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3" data-reveal="fade">
          <Heart className="w-8 h-8 mx-auto text-secondary-400" />
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold">Destinasi Tersimpan</h1>
          <p className="text-sm text-stone-200 max-w-xl mx-auto">
            Daftar wisata favoritmu. Tersimpan di perangkat ini saja (tanpa akun) dan tidak dikirim ke server.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center space-y-3">
            <p className="text-sm text-stone-600">Belum ada destinasi tersimpan.</p>
            <p className="text-xs text-stone-500">Tekan ikon hati pada kartu atau halaman destinasi untuk menyimpannya.</p>
            <Link href="/destinasi" className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-primary-800 text-white text-sm font-semibold hover:bg-primary-900">
              Jelajahi Destinasi
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span aria-live="polite">{items.length} destinasi tersimpan</span>
              <button
                type="button"
                onClick={() => confirm("Hapus semua destinasi tersimpan?") && clear()}
                className="inline-flex items-center gap-1.5 text-rose-600 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus semua
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((d) => (
                <div key={d.slug} className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className={`relative isolate h-48 bg-gradient-to-t ${d.coverGradient} p-4 flex flex-col justify-between overflow-hidden`}>
                    <CoverImage src={d.coverUrl} alt={d.name} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                    <div className="flex items-start justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-black/50 text-[11px] font-semibold text-secondary-300 border border-white/10">{d.categoryLabel}</span>
                      <WishlistButton slug={d.slug} name={d.name} />
                    </div>
                    <div className="flex items-center gap-1 text-amber-300 text-xs font-bold self-start bg-black/50 px-2 py-0.5 rounded">
                      <Star className="w-3.5 h-3.5 fill-amber-300" /> {d.rating || "–"}
                    </div>
                  </div>
                  <div className="p-5 space-y-2 flex-1 flex flex-col">
                    <h2 className="font-heading font-bold text-base text-stone-900">
                      <Link href={`/destinasi/${d.slug}`} className="hover:text-primary-800">{d.name}</Link>
                    </h2>
                    <p className="flex items-center gap-1.5 text-xs text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-secondary-500" /> Kec. {d.district}
                    </p>
                    <p className="text-xs text-stone-600 line-clamp-2">{d.summary}</p>
                    <p className="mt-auto pt-3 text-sm font-bold text-primary-800">{formatRupiah(d.ticketWeekday)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
