"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Mountain,
  Waves,
  Home,
  Landmark,
  TreePine,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import type { DestinationDetail } from "@/types/destination";
import { PURBALINGGA_DISTRICTS } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/public/wishlist";
import { CoverImage } from "@/components/ui/cover-image";

export function DestinationCatalog({
  destinations,
  initialCategory = "semua",
  initialQuery = "",
}: {
  destinations: DestinationDetail[];
  initialCategory?: string;
  initialQuery?: string;
}) {
  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategory);
  const [seenParams, setSeenParams] = React.useState(`${initialCategory}|${initialQuery}`);
  if (seenParams !== `${initialCategory}|${initialQuery}`) {
    setSeenParams(`${initialCategory}|${initialQuery}`);
    setSelectedCategory(initialCategory);
    setSearchQuery(initialQuery);
  }
  const [selectedDistrict, setSelectedDistrict] = React.useState<string>("semua");
  const [priceFilter, setPriceFilter] = React.useState<string>("semua");
  const [sortBy, setSortBy] = React.useState<string>("rekomendasi");

  const categories = [
    { id: "semua", label: "Semua Kategori", icon: SlidersHorizontal },
    { id: "wisata-alam", label: "Wisata Alam", icon: Mountain },
    { id: "wisata-air", label: "Wisata Air", icon: Waves },
    { id: "desa-wisata", label: "Desa Wisata", icon: Home },
    { id: "sejarah-budaya", label: "Sejarah & Budaya", icon: Landmark },
    { id: "taman-rekreasi", label: "Taman Rekreasi", icon: TreePine },
  ];

  // Filtering Logic
  const filtered = destinations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "semua" || item.category === selectedCategory;

    const matchesDistrict =
      selectedDistrict === "semua" || item.district === selectedDistrict;

    let matchesPrice = true;
    if (priceFilter === "gratis") {
      matchesPrice = item.ticketWeekday === 0;
    } else if (priceFilter === "bawah-20") {
      matchesPrice = item.ticketWeekday < 20000;
    } else if (priceFilter === "20-50") {
      matchesPrice = item.ticketWeekday >= 20000 && item.ticketWeekday <= 50000;
    }

    return matchesSearch && matchesCategory && matchesDistrict && matchesPrice;
  });

  // Sorting Logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "harga-rendah") return a.ticketWeekday - b.ticketWeekday;
    if (sortBy === "harga-tinggi") return b.ticketWeekday - a.ticketWeekday;
    if (sortBy === "nama") return a.name.localeCompare(b.name);
    return 0; // rekomendasi
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("semua");
    setSelectedDistrict("semua");
    setPriceFilter("semua");
    setSortBy("rekomendasi");
  };

  return (
    <div className="space-y-12 pb-20">
      {/* 1. JUDUL KATALOG + PENCARIAN (hero kini ada di halaman) */}
      <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 scroll-mt-24 space-y-6 text-center">
        <h2 className="font-display font-semibold text-3xl sm:text-5xl text-primary-800">Semua Destinasi</h2>
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama objek wisata, curug, goa, atau kecamatan..."
            aria-label="Cari destinasi"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-stone-300 text-sm text-stone-900 placeholder-stone-500 focus:outline-none focus:border-primary-800 shadow-sm"
          />
        </div>
      </section>

      {/* 2. CATEGORY PILLS FILTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:justify-center">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-heading font-semibold whitespace-nowrap transition-all shadow-md cursor-pointer ${
                  isSelected
                    ? "bg-secondary-500 text-primary-950 font-semibold border border-secondary-400"
                    : "bg-white hover:bg-stone-50 text-stone-700 border border-stone-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-secondary-600"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. SECONDARY CONTROLS (District, Price, Sorting) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Kecamatan Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="select-district" className="text-xs font-semibold text-stone-600">
                Kecamatan:
              </label>
              <select
                id="select-district"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 font-medium text-stone-800 focus:outline-none focus:border-primary-500"
              >
                <option value="semua">Semua Kecamatan (18)</option>
                {PURBALINGGA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    Kec. {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Tiket Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="select-price" className="text-xs font-semibold text-stone-600">
                Tiket:
              </label>
              <select
                id="select-price"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 font-medium text-stone-800 focus:outline-none focus:border-primary-500"
              >
                <option value="semua">Semua Harga</option>
                <option value="bawah-20">&lt; Rp 20.000</option>
                <option value="20-50">Rp 20.000 - Rp 50.000</option>
              </select>
            </div>

            {(searchQuery || selectedCategory !== "semua" || selectedDistrict !== "semua" || priceFilter !== "semua") && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <label htmlFor="select-sort" className="text-xs font-semibold text-stone-600">
              Urutkan:
            </label>
            <select
              id="select-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-stone-50 border border-stone-200 text-xs rounded-lg px-3 py-2 font-medium text-stone-800 focus:outline-none focus:border-primary-500"
            >
              <option value="rekomendasi">Rekomendasi</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="harga-rendah">Tiket Termurah</option>
              <option value="harga-tinggi">Tiket Termahal</option>
              <option value="nama">Nama (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 4. DESTINATION CARDS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <p>Menampilkan <strong>{sorted.length}</strong> destinasi wisata</p>
          <span className="text-secondary-600 font-semibold">✦ Purbalingga Memikat</span>
        </div>

        {sorted.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-lg text-stone-800">
              Tidak Ada Destinasi yang Cocok
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Tidak ditemukan objek wisata dengan kriteria pencarian Anda. Coba ganti kata kunci atau reset filter Anda.
            </p>
            <Button size="sm" variant="outline" onClick={resetFilters}>
              Reset Semua Filter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-500 transition-all duration-300 flex flex-col justify-between" data-reveal
              >
                <div>
                  {/* Photo Frame with Gradient & Badge */}
                  <div className={`h-52 bg-gradient-to-t ${item.coverGradient} relative isolate p-4 flex flex-col justify-between overflow-hidden`}>
                    <CoverImage src={item.coverUrl} alt={item.name} />
                    <WishlistButton slug={item.slug} name={item.name} className="absolute bottom-3 right-3 z-20" />
                    <div className="flex items-center justify-between z-10">
                      <span className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-xs text-[11px] font-semibold text-secondary-300 border border-white/10">
                        {item.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded text-amber-300 text-xs font-bold border border-white/10">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <div className="z-10">
                      <span className="bg-white/90 text-primary-950 font-bold text-[11px] px-2.5 py-1 rounded-md shadow">
                        Mulai {formatRupiah(item.ticketWeekday)}
                      </span>
                    </div>

                    {/* Ambient subtle glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(212,163,115,0.2),transparent_70%)] pointer-events-none" />
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-secondary-500 shrink-0" />
                      <span>Kecamatan {item.district}</span>
                    </div>

                    <h3 className="font-editorial text-xl font-bold text-stone-900 group-hover:text-primary-800 transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-body">
                      {item.summary}
                    </p>

                    {/* Quick Facilities Preview */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.facilities.slice(0, 3).map((fac, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
                        >
                          {fac.split(" ")[0]} {fac.split(" ")[1] ?? ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-3">
                  <span className="text-stone-500">{item.openingHours}</span>
                  <Link
                    href={`/destinasi/${item.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-secondary-600 group-hover:text-secondary-700 hover:underline"
                  >
                    <span>Detail Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
