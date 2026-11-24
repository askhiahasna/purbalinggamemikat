"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { SiteSettings } from "@/lib/data/cms-store";
import { CoverImage } from "@/components/ui/cover-image";

export interface HeroDestination {
  id: string;
  slug: string;
  name: string;
  category: string;
  district: string;
  desc: string;
  coverUrl: string | null;
  coverGradient: string;
}

/** Foto latar bawaan bila admin belum mengunggah (placeholder: ganti dengan foto asli). */
export const HERO_BG_FALLBACK = "/images/hero-bg.jpg";

export function HeroSlider({
  settings,
  destinations,
}: {
  settings: SiteSettings;
  destinations: HeroDestination[];
}) {
  const [bgFailed, setBgFailed] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const count = destinations.length;
  const prevSlide = () => setActiveIndex((prev) => (prev === 0 ? count - 1 : prev - 1));
  const nextSlide = () => setActiveIndex((prev) => (prev === count - 1 ? 0 : prev + 1));
  // Dua kartu terlihat, melingkar. Aman untuk 0/1/2+ destinasi.
  const visible = Array.from({ length: Math.min(2, count) }, (_, k) => destinations[(activeIndex + k) % count]);
  const bgSrc = settings.heroBgUrl || HERO_BG_FALLBACK;

  return (
    <section className="relative overflow-hidden bg-primary-950 text-white min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] flex items-center">
      {/* Foto latar hero + overlay hijau transparan (teks tetap terbaca) */}
      {!bgFailed && (
        <Image
          src={bgSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover z-0"
          onError={() => setBgFailed(true)}
        />
      )}
      <div className="absolute inset-0 bg-primary-950/75 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-950/55 to-primary-950/90 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-800/40 via-transparent to-transparent z-0" />

      {/* Subtle organic ambient light */}
      <div className="absolute top-12 right-12 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Heading with Strict Font Styling */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Brand Federo Badge */}
            <div className="inline-flex items-center gap-2">
              <span className="font-brand text-xs sm:text-sm uppercase tracking-widest px-3 py-1 rounded-full bg-secondary-500 text-white font-normal shadow-sm">
                {settings.siteName || "Purbalingga Memikat"}
              </span>
              <span className="text-xs text-secondary-400 font-medium tracking-wide">
                ✦ {settings.heroBadge || "Bumi Perwira"}
              </span>
            </div>

            {/* Title: "Welcome to" in Poppins, "Purbalingga" in DM Serif Display */}
            <div className="space-y-1">
              <span className="font-heading text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-stone-100 block">
                {settings.heroTitlePrefix || "Welcome to"}
              </span>
              <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-secondary-500 leading-[1.05]">
                {settings.heroTitleMain || "Purbalingga"}
              </h1>
            </div>

            <p className="font-body text-sm sm:text-base text-stone-200 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              {settings.heroSubtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                href="/destinasi"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white font-heading font-semibold text-sm shadow-md transition-all cursor-pointer"
              >
                Mulai Eksplorasi
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/kuliner"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-heading font-semibold text-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 mr-2 text-secondary-400" />
                Kuliner Khas
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Destination Cards Slider */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold font-heading">
                Destinasi Unggulan
              </span>
              {/* Carousel Controls */}
              <div className={`flex items-center gap-2 ${count <= 2 ? "hidden" : ""}`}>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Destinasi sebelumnya"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary-500 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Destinasi berikutnya"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary-500 text-white flex items-center justify-center border border-white/20 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slider Cards Container */}
            {count === 0 ? (
              <div className="rounded-2xl border border-white/15 bg-white/5 p-8 text-center text-xs text-stone-300">
                Destinasi unggulan akan tampil di sini setelah ditambahkan melalui CMS.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visible.map((item) => (
                  <div
                    key={item.id}
                    className="group relative isolate rounded-2xl overflow-hidden border border-white/15 p-6 h-72 sm:h-80 flex flex-col justify-end transition-all duration-300 hover:scale-[1.02] shadow-xl"
                  >
                    {/* Gradient = fallback bila destinasi belum punya foto */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${item.coverGradient}`} />
                    <CoverImage src={item.coverUrl} alt={item.name} sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw" />

                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-xs text-[11px] font-semibold text-secondary-400 border border-white/10">
                        {item.category}
                      </span>
                    </div>

                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-stone-300">
                        <MapPin className="w-3.5 h-3.5 text-secondary-400 shrink-0" />
                        <span>Kec. {item.district}</span>
                      </div>
                      <h3 className="font-editorial text-2xl font-bold text-white tracking-wide group-hover:text-secondary-400 transition-colors uppercase">
                        {item.name}
                      </h3>
                      <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed font-body">{item.desc}</p>
                      <Link
                        href={`/destinasi/${item.slug}`}
                        className="inline-flex items-center text-xs font-semibold text-secondary-400 group-hover:text-secondary-300 pt-2"
                      >
                        Lihat Info Lengkap <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Indicator Dots */}
            <div className={`flex justify-center items-center gap-2 pt-2 ${count <= 2 ? "hidden" : ""}`}>
              {destinations.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeIndex === idx ? "w-6 bg-secondary-500" : "w-2 bg-white/20"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
