"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Utensils,
  Cookie,
  Coffee,
  ShoppingBag,
  MapPin,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CoverImage } from "@/components/ui/cover-image";

export interface CulinaryItem {
  id: string;
  name: string;
  category: string;
  district: string;
  priceRange: string;
  desc: string;
  isHalal: boolean;
  imageUrl: string | null;
}

export function CulinaryCatalog({ culinaryItems }: { culinaryItems: CulinaryItem[] }) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("semua");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const categories = [
    { id: "semua", label: "Semua Kuliner", icon: Utensils },
    { id: "makanan-berat", label: "Makanan Berat", icon: Utensils },
    { id: "cemilan", label: "Cemilan & Jajanan", icon: Cookie },
    { id: "minuman", label: "Minuman", icon: Coffee },
    { id: "oleh-oleh", label: "Oleh-Oleh", icon: ShoppingBag },
  ];

  const filteredItems = culinaryItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "semua" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-14 pb-20">
      {/* 1. HERO HEADER KULINER (Direct from Mockup 2) */}
      <section className="relative overflow-hidden bg-primary-950 text-white pt-20 pb-28 sm:pt-28 sm:pb-36">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-900 to-amber-950/80 z-0 opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,163,115,0.25),transparent_60%)] z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Badge variant="secondary" className="px-3 py-1 text-xs uppercase tracking-widest font-bold">
            ✦ Kuliner & Oleh-Oleh Khas
          </Badge>

          <div className="max-w-2xl space-y-3">
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Lezatnya Kuliner <span className="text-secondary-400">Purbalingga</span>
            </h1>
            <p className="font-body text-sm sm:text-base text-stone-200 leading-relaxed">
              Nikmati cita rasa khas Purbalingga yang kaya akan tradisi dan budaya lokal.
              Dari sajian soto berkuah hangat hingga aneka oleh-oleh manis legit.
            </p>
          </div>

          {/* Search Bar Input (Matching Mockup 2) */}
          <div className="max-w-xl pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kuliner favorit di Purbalingga (mendoan, soto, dsb)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-sm text-white placeholder-stone-300 focus:outline-none focus:bg-white/20 focus:border-secondary-400 shadow-xl transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILL SELECTORS (Matching Mockup 2 with 4 pill buttons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-3 sm:p-4 rounded-3xl shadow-xl border border-stone-200/80">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl text-xs sm:text-sm font-heading font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary-900 text-white shadow-md border border-secondary-400/40"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60"
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-secondary-400" : "text-stone-500"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. MENU PILIHAN KULINER (Grid of Cards Matching Mockup 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-primary-950">
              Menu Pilihan Kuliner
            </h2>
            <p className="text-xs text-stone-500 font-body mt-1">
              Menampilkan {filteredItems.length} kuliner khas Purbalingga
            </p>
          </div>
          <span className="text-xs text-secondary-600 font-semibold">
            ✦ Cita Rasa Otentik Banyumasan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="group hover:shadow-xl hover:border-primary-500 transition-all duration-300 flex flex-col justify-between"
              data-reveal
            >
              <div>
                {/* Photo Placeholder Frame (Matching Mockup with rounded food frame) */}
                <div className="h-48 bg-gradient-to-br from-amber-900/80 via-primary-900 to-primary-950 relative isolate overflow-hidden flex items-center justify-center text-white p-4 text-center">
                  <CoverImage src={item.imageUrl} alt={item.name} sizes="(min-width: 1024px) 25vw, 50vw" />
                  <Utensils className="w-12 h-12 text-secondary-400/60 group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-xs text-[10px] font-bold text-secondary-300 px-2 py-0.5 rounded border border-white/10 uppercase">
                    Khas Purbalingga
                  </span>
                  <span className="absolute bottom-3 right-3 bg-emerald-800/80 text-[10px] font-semibold text-white px-2 py-0.5 rounded">
                    Halal
                  </span>
                </div>

                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-secondary-500 shrink-0" />
                    <span>Kecamatan {item.district}</span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-stone-900 group-hover:text-primary-800 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-600 font-body line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </div>

              <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-2">
                <span className="font-bold text-primary-800">{item.priceRange}</span>
                <span className="text-secondary-600 font-semibold group-hover:underline flex items-center gap-1">
                  Info <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. MINI PETA LOKASI KULINER (Matching Mockup 2 Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs uppercase tracking-widest text-secondary-600 font-bold block">
              Eksplorasi Geografis
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-primary-950">
              Sentra & Titik Kuliner Purbalingga
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-body">
              Temukan lokasi pusat jajanan, sentra oleh-oleh, dan rumah makan legendaris
              langsung dari peta wilayah Kabupaten Purbalingga. Dari pusat kuliner Alun-Alun
              hingga sentra sate Blater di Kalimanah.
            </p>
            <div className="pt-2">
              <Link href="/destinasi?kategori=kuliner">
                <Button variant="primary" size="md" className="shadow-md">
                  Buka Peta Lengkap
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mini Map Graphic Preview */}
          <div className="lg:col-span-6">
            <div className="h-60 sm:h-72 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-50 to-stone-200 border-2 border-stone-300 p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between text-xs font-semibold text-primary-900 z-10">
                <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-stone-300">
                  <MapPin className="w-4 h-4 text-secondary-600" />
                  Kawasan Kuliner Purbalingga Kota
                </span>
                <span className="bg-primary-900 text-white px-2 py-0.5 rounded text-[10px]">
                  Peta Digital
                </span>
              </div>

              {/* Decorative map grid lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#2A7F8D_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

              <div className="z-10 bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-stone-200/80 space-y-1 text-xs">
                <p className="font-bold text-stone-800">Sentra Kuliner Utama:</p>
                <p className="text-stone-600 text-[11px]">
                  1. Kawasan Wisata Kuliner Kya-Kya Gang Mayong • 2. Sentra Sate Blater Kalimanah • 3. Sentra Nopia Kemangkon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
