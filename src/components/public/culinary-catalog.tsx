"use client";

import * as React from "react";
import Link from "next/link";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { CoverImage } from "@/components/ui/cover-image";
import type { PublicCulinary } from "@/server/queries/content";

export type CulinaryItem = PublicCulinary;

/** Katalog semua kuliner (cari + filter kategori). Kartu menaut ke halaman detail. */
export function CulinaryCatalog({
  items,
  categories,
  initialCategory = "semua",
}: {
  items: CulinaryItem[];
  categories: { id: string; label: string }[];
  initialCategory?: string;
}) {
  const resolved = categories.some((c) => c.id === initialCategory) ? initialCategory : "semua";
  const [category, setCategory] = React.useState(resolved);
  const [seen, setSeen] = React.useState(resolved);
  if (seen !== resolved) {
    // navigasi ?kategori= (klik tile di hero) → sinkronkan filter tanpa efek samping
    setSeen(resolved);
    setCategory(resolved);
  }
  const [q, setQ] = React.useState("");

  const filtered = items.filter((i) => {
    const needle = q.trim().toLowerCase();
    return (
      (category === "semua" || i.category === category) &&
      (!needle || `${i.name} ${i.desc} ${i.district}`.toLowerCase().includes(needle))
    );
  });

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-xs sm:text-sm font-heading font-semibold border transition-colors cursor-pointer ${
      active ? "bg-primary-800 text-white border-primary-800" : "bg-white text-stone-700 border-stone-300 hover:border-primary-800 hover:text-primary-800"
    }`;

  return (
    <section id="katalog" aria-labelledby="katalog-judul" className="bg-mist py-14 sm:py-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2 text-center">
          <h2 id="katalog-judul" className="font-display font-semibold text-3xl sm:text-5xl text-primary-800">
            Semua Kuliner
          </h2>
          <p className="text-sm text-stone-600 font-body" aria-live="polite">
            Menampilkan {filtered.length} dari {items.length} kuliner khas Purbalingga
          </p>
        </div>

        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kuliner (mendoan, soto, kecamatan...)"
            aria-label="Cari kuliner"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-stone-300 text-sm text-stone-900 placeholder-stone-500 focus:outline-none focus:border-primary-800 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter kategori">
          <button type="button" aria-pressed={category === "semua"} onClick={() => setCategory("semua")} className={chip(category === "semua")}>
            Semua
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(c.id)} className={chip(category === c.id)}>
              {c.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14 text-sm text-stone-500 bg-white rounded-3xl border border-dashed border-stone-300">
            Tidak ada kuliner yang cocok. Coba kata kunci atau kategori lain.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((item) => (
              <li key={item.id} data-reveal>
                <Link
                  href={`/kuliner/${item.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-800"
                >
                  <div className="relative isolate h-44 bg-gradient-to-br from-amber-900/80 via-primary-900 to-primary-950 overflow-hidden">
                    <CoverImage src={item.imageUrl} alt={item.name} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" />
                    <span className="absolute top-3 left-3 rounded bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase text-secondary-200 backdrop-blur-xs">{item.categoryLabel}</span>
                    {item.isHalal && <span className="absolute bottom-3 right-3 rounded bg-emerald-700 px-2 py-0.5 text-[10px] font-semibold text-white">Halal</span>}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="flex items-center gap-1.5 text-xs text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-secondary-600" /> Kec. {item.district}
                    </p>
                    <h3 className="font-display font-medium text-xl leading-tight text-stone-900 group-hover:text-primary-800">{item.name}</h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-stone-600">{item.desc}</p>
                    <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                      <span className="font-bold text-primary-800">{item.priceRange}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary-800">
                        Buka <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
