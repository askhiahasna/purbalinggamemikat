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

// Jumlah kartu terlihat: 2 di layar >= 640px, 1 di bawahnya (sinkron dengan kelas Tailwind `sm:`).
const MQ = "(min-width: 640px)";
const subscribeMq = (cb: () => void) => {
  const m = window.matchMedia(MQ);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export function HeroSlider({ settings, destinations }: { settings: SiteSettings; destinations: HeroDestination[] }) {
  const [bgFailed, setBgFailed] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const perView = React.useSyncExternalStore(subscribeMq, () => (window.matchMedia(MQ).matches ? 2 : 1), () => 2);

  const count = destinations.length;
  const maxIndex = Math.max(0, count - perView);
  const current = Math.min(index, maxIndex);
  const prev = () => setIndex(current === 0 ? maxIndex : current - 1);
  const next = () => setIndex(current >= maxIndex ? 0 : current + 1);
  const bgSrc = settings.heroBgUrl || HERO_BG_FALLBACK;
  const canSlide = count > perView;

  // Geser sentuh: kartu mengikuti jari, lepas melewati ambang -> pindah slide. Scroll vertikal tetap normal (touch-action: pan-y).
  const [dragX, setDragX] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const gesture = React.useRef<{ x: number; y: number; id: number; horizontal: boolean | null; moved: boolean } | null>(null);
  const suppressClick = React.useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canSlide || e.pointerType === "mouse") return; // mouse memakai tombol panah
    gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId, horizontal: null, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (g.horizontal === null && Math.hypot(dx, dy) > 8) {
      g.horizontal = Math.abs(dx) > Math.abs(dy);
      if (g.horizontal) {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }
    }
    if (g.horizontal) {
      g.moved = true;
      setDragX(dx);
    }
  };
  const endGesture = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    if (g.horizontal) {
      const width = e.currentTarget.getBoundingClientRect().width;
      const threshold = Math.min(80, width * 0.15);
      if (e.type === "pointerup") {
        if (dragX <= -threshold) next();
        else if (dragX >= threshold) prev();
      }
      suppressClick.current = true; // jangan ikut menekan tautan kartu setelah menggeser
      window.setTimeout(() => (suppressClick.current = false), 0);
    }
    setDragging(false);
    setDragX(0);
  };

  return (
    <section className="relative isolate overflow-hidden bg-primary-800 text-white min-h-[640px] lg:min-h-[760px] flex items-center">
      {/* Foto latar: tampil jelas di atas, memudar ke hijau solid #174C3C di bawah (menyatu dengan bagian Sambutan) */}
      {!bgFailed && (
        <Image src={bgSrc} alt="" fill priority sizes="100vw" className="object-cover -z-20" onError={() => setBgFailed(true)} />
      )}
      {/* Urutan penting: gradien horizontal (keterbacaan teks) di BAWAH gradien vertikal, supaya dasar hero tepat hijau solid */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-primary-800/55 to-primary-800" />
      <div aria-hidden className="absolute top-24 right-10 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 sm:pb-28 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Kiri: judul */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="font-brand text-xs sm:text-sm uppercase tracking-widest px-3 py-1 rounded-full bg-secondary-500 text-primary-950 font-normal shadow-sm">
                {settings.siteName || "Purbalingga Memikat"}
              </span>
              <span className="text-xs text-secondary-200 font-semibold tracking-wide">✦ {settings.heroBadge || "Bumi Perwira"}</span>
            </div>

            <div className="space-y-1">
              <span className="font-heading text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white block [text-shadow:0_2px_14px_rgb(0_0_0/0.45)]">
                {settings.heroTitlePrefix || "Welcome to"}
              </span>
              <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-secondary-400 leading-[1.05] [text-shadow:0_3px_18px_rgb(0_0_0/0.45)]">
                {settings.heroTitleMain || "Purbalingga"}
              </h1>
            </div>

            <p className="font-body text-sm sm:text-base text-white max-w-xl mx-auto lg:mx-0 leading-relaxed [text-shadow:0_1px_10px_rgb(0_0_0/0.5)]">
              {settings.heroSubtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                href="/destinasi"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-secondary-500 hover:bg-secondary-400 text-primary-950 font-heading font-bold text-sm shadow-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Mulai Eksplorasi
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/kuliner"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/50 font-heading font-semibold text-sm backdrop-blur-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Sparkles className="w-4 h-4 mr-2 text-secondary-300" />
                Kuliner Khas
              </Link>
            </div>
          </div>

          {/* Kanan: carousel destinasi (geser halus) */}
          <div className="lg:col-span-6 space-y-4 min-w-0">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs uppercase tracking-wider text-white font-bold font-heading [text-shadow:0_1px_8px_rgb(0_0_0/0.5)]">Destinasi Unggulan</span>
              {canSlide && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Destinasi sebelumnya"
                    className="w-9 h-9 rounded-full bg-white/15 hover:bg-secondary-500 text-white hover:text-primary-950 flex items-center justify-center border border-white/40 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Destinasi berikutnya"
                    className="w-9 h-9 rounded-full bg-white/15 hover:bg-secondary-500 text-white hover:text-primary-950 flex items-center justify-center border border-white/40 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {count === 0 ? (
              <div className="rounded-2xl border border-white/25 bg-black/25 p-8 text-center text-xs text-white">
                Destinasi unggulan akan tampil di sini setelah ditambahkan melalui CMS.
              </div>
            ) : (
              <div
                className="overflow-hidden -mx-2 touch-pan-y"
                role="region"
                aria-roledescription="carousel"
                aria-label="Destinasi unggulan"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endGesture}
                onPointerCancel={endGesture}
                onClickCapture={(e) => {
                  if (suppressClick.current) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <ul
                  data-testid="hero-track"
                  className={`flex ${dragging ? "" : "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"} [--per:1] sm:[--per:2]`}
                  style={{ transform: `translateX(calc(${current} * -100% / var(--per) + ${dragX}px))` }}
                >
                  {destinations.map((item, i) => {
                    const visible = i >= current && i < current + perView;
                    return (
                      <li key={item.id} className="shrink-0 basis-full sm:basis-1/2 px-2" aria-hidden={!visible} inert={!visible}>
                        <div className="group relative isolate rounded-2xl overflow-hidden border border-white/25 p-6 h-72 sm:h-80 flex flex-col justify-end shadow-xl transition-transform duration-300 hover:-translate-y-1">
                          <div className={`absolute inset-0 bg-gradient-to-t ${item.coverGradient}`} />
                          <CoverImage src={item.coverUrl} alt={item.name} sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw" />

                          <div className="absolute top-4 left-4 z-10">
                            <span className="px-2.5 py-1 rounded-md bg-black/55 backdrop-blur-xs text-[11px] font-bold text-secondary-200 border border-white/20">
                              {item.category}
                            </span>
                          </div>

                          <div className="relative z-10 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs text-white">
                              <MapPin className="w-3.5 h-3.5 text-secondary-300 shrink-0" />
                              <span>Kec. {item.district}</span>
                            </div>
                            <h3 className="font-editorial text-2xl font-bold text-white tracking-wide group-hover:text-secondary-300 transition-colors uppercase">{item.name}</h3>
                            <p className="text-xs text-stone-100 line-clamp-2 leading-relaxed font-body">{item.desc}</p>
                            <Link href={`/destinasi/${item.slug}`} className="inline-flex items-center text-xs font-bold text-secondary-300 hover:text-secondary-200 pt-2">
                              Lihat Info Lengkap <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {canSlide && (
              <div className="flex justify-center items-center gap-2 pt-1">
                {Array.from({ length: maxIndex + 1 }, (_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIndex(idx)}
                    aria-label={`Tampilkan slide ${idx + 1}`}
                    aria-current={current === idx}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${current === idx ? "w-6 bg-secondary-500" : "w-2 bg-white/50 hover:bg-white/80"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
