"use client";

import * as React from "react";
import Link from "next/link";
import { Search, MapPin, Phone, Globe, MessageCircle, Map as MapIcon, BedDouble, RotateCcw } from "lucide-react";
import { CoverImage } from "@/components/ui/cover-image";
import { priceRangeLabel, waLink } from "@/lib/contact";
import type { PublicAccommodation } from "@/server/queries/accommodation";

const PRICE_FILTERS = [
  { id: "semua", label: "Semua harga" },
  { id: "bawah-200", label: "< Rp 200.000" },
  { id: "200-500", label: "Rp 200.000 – 500.000" },
  { id: "atas-500", label: "> Rp 500.000" },
];

function matchesPrice(a: PublicAccommodation, f: string) {
  if (f === "semua") return true;
  const p = a.priceFrom ?? a.priceTo;
  if (p === null) return false;
  if (f === "bawah-200") return p < 200_000;
  if (f === "200-500") return p >= 200_000 && p <= 500_000;
  return p > 500_000;
}

/** Hanya tautan http(s) yang dirender sebagai link (pertahanan berlapis selain validasi server). */
const safeHttp = (u: string | null) => (u && /^https?:\/\//i.test(u) ? u : null);
const telHref = (p: string | null) => (p && /^[0-9+\s()-]{6,25}$/.test(p) ? `tel:${p.replace(/[^\d+]/g, "")}` : null);

export function AccommodationCatalog({ items, initialType = "semua" }: { items: PublicAccommodation[]; initialType?: string }) {
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState(initialType);
  const [seenType, setSeenType] = React.useState(initialType);
  if (seenType !== initialType) {
    setSeenType(initialType);
    setType(initialType);
  }
  const [district, setDistrict] = React.useState("semua");
  const [price, setPrice] = React.useState("semua");

  const types = React.useMemo(() => [...new Map(items.map((i) => [i.type, i.typeLabel])).entries()], [items]);
  const districts = React.useMemo(() => [...new Set(items.map((i) => i.district))].sort(), [items]);

  const filtered = items.filter((a) => {
    const text = `${a.name} ${a.district} ${a.description} ${a.facilities.join(" ")}`.toLowerCase();
    return (
      text.includes(q.toLowerCase()) &&
      (type === "semua" || a.type === type) &&
      (district === "semua" || a.district === district) &&
      matchesPrice(a, price)
    );
  });

  const reset = () => {
    setQ("");
    setType("semua");
    setDistrict("semua");
    setPrice("semua");
  };

  const field =
    "bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-primary-500";

  return (
    <div className="pb-0">

      <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 scroll-mt-24 space-y-8">
        <h2 className="font-display font-semibold text-center text-3xl sm:text-5xl text-primary-800">Semua Penginapan</h2>
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-lg p-4 sm:p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama, kecamatan, atau fasilitas (mis. sarapan, wifi)..."
              aria-label="Cari penginapan"
              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Jenis" className={field}>
              <option value="semua">Semua jenis</option>
              {types.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="Kecamatan" className={field}>
              <option value="semua">Semua kecamatan</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Harga" className={field}>
              {PRICE_FILTERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-800 hover:underline cursor-pointer ml-auto">
              <RotateCcw className="w-3.5 h-3.5" /> Atur ulang
            </button>
          </div>
          <p className="text-xs text-stone-500" aria-live="polite">
            Menampilkan {filtered.length} dari {items.length} penginapan
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-stone-500 bg-white rounded-3xl border border-dashed border-stone-300">
            {items.length === 0 ? "Data penginapan belum tersedia." : "Tidak ada penginapan yang cocok dengan filter."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => {
              const price = priceRangeLabel(a.priceFrom, a.priceTo);
              const wa = waLink(a.whatsappNumber, `Halo, saya ingin bertanya tentang ${a.name} (dari Purbalingga Memikat).`);
              const tel = telHref(a.phone);
              const web = safeHttp(a.websiteUrl);
              return (
                <article
                  key={a.id}
                  id={a.slug}
                  data-reveal
                  className="group scroll-mt-28 bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-500 transition-all duration-300 flex flex-col"
                >
                  <div className="relative isolate h-48 bg-gradient-to-br from-primary-900 to-primary-950 overflow-hidden flex items-center justify-center">
                    <CoverImage src={a.imageUrl} alt={a.name} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
                    {!a.imageUrl && <BedDouble className="w-12 h-12 text-secondary-400/60" />}
                    <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-xs text-[11px] font-semibold text-secondary-300 px-2.5 py-1 rounded-md border border-white/10">
                      {a.typeLabel}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="space-y-1">
                      <h2 className="font-heading font-bold text-base text-stone-900 leading-snug">{a.name}</h2>
                      <p className="flex items-center gap-1.5 text-xs text-stone-500">
                        <MapPin className="w-3.5 h-3.5 text-secondary-500 shrink-0" />
                        Kec. {a.district}
                      </p>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">{a.description}</p>
                    {a.facilities.length > 0 && (
                      <ul className="flex flex-wrap gap-1.5">
                        {a.facilities.slice(0, 5).map((f) => (
                          <li key={f} className="text-[10px] font-medium text-primary-800 bg-primary-50 px-2 py-0.5 rounded-full">
                            {f}
                          </li>
                        ))}
                        {a.facilities.length > 5 && <li className="text-[10px] text-stone-400">+{a.facilities.length - 5}</li>}
                      </ul>
                    )}
                    <div className="mt-auto pt-3 border-t border-stone-100 space-y-3">
                      <p className="text-sm">
                        {price ? (
                          <>
                            <span className="font-bold text-primary-800">{price}</span>
                            <span className="text-xs text-stone-500"> / malam</span>
                          </>
                        ) : (
                          <span className="text-xs text-stone-500">Tarif: hubungi pengelola</span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        {wa && (
                          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                        {tel && (
                          <a href={tel} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors">
                            <Phone className="w-3.5 h-3.5" /> Telepon
                          </a>
                        )}
                        {web && (
                          <a href={web} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors">
                            <Globe className="w-3.5 h-3.5" /> Website
                          </a>
                        )}
                        {a.latitude !== null && a.longitude !== null && (
                          <Link href={`/peta?akomodasi=${encodeURIComponent(a.slug)}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors">
                            <MapIcon className="w-3.5 h-3.5" /> Peta
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
