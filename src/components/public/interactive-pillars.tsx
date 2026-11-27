"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mountain, Utensils, Calendar } from "lucide-react";

export interface PillarContent {
  /** Foto kartu (dari konten unggulan/terbaru kategori terkait); null = ikon sebagai pengganti. */
  image: string | null;
  /** Nama item yang difoto (untuk alt). */
  imageAlt: string;
  /** Deskripsi dari Pengaturan CMS. */
  description: string;
}

/** Bingkai kapsul di tengah kartu: foto dinamis, atau ikon bila belum ada foto. */
function PillarFrame({
  image,
  alt,
  icon: Icon,
  badge,
  active,
  accent,
  className,
  sizes,
}: {
  image: string | null;
  alt: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  active: boolean;
  accent: string;
  className: string;
  sizes: string;
}) {
  return (
    <div
      className={`relative overflow-hidden border-2 transition-all duration-500 shadow-md flex flex-col items-center justify-center text-center p-3 ${className} ${
        active ? "border-secondary-400 bg-gradient-to-b " + accent : "border-stone-200 bg-stone-100"
      } ${image && !active ? "opacity-80 saturate-75" : !image && !active ? "opacity-60" : ""}`}
    >
      {image ? (
        <>
          <Image src={image} alt={alt} fill sizes={sizes} className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/55 text-secondary-300 backdrop-blur-xs whitespace-nowrap">
            {badge}
          </span>
        </>
      ) : (
        <>
          <Icon className={`w-10 h-10 mb-2 ${active ? "text-white" : "text-stone-400"}`} />
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${active ? "bg-black/40 text-secondary-300" : "bg-stone-200 text-stone-600"}`}>
            {badge}
          </span>
        </>
      )}
    </div>
  );
}

export function InteractivePillars({ content }: { content: [PillarContent, PillarContent, PillarContent] }) {
  const [activeTab, setActiveTab] = React.useState<number>(0);

  const pillars = [
    {
      id: "01",
      number: "01",
      title: "WISATA",
      subtitle: "Pesona Alam & Rekreasi",
      href: "/destinasi",
      badge: "Alam & Rekreasi",
      icon: Mountain,
      accentColor: "from-primary-800 to-primary-950",
    },
    {
      id: "02",
      number: "02",
      title: "KULINER & OLEH-OLEH",
      subtitle: "Cita Rasa Otentik",
      href: "/kuliner",
      badge: "Cita Rasa Lokal",
      icon: Utensils,
      accentColor: "from-secondary-800 to-primary-950",
    },
    {
      id: "03",
      number: "03",
      title: "ACARA MENDATANG",
      subtitle: "Festival & Tradisi Budaya",
      href: "/budaya-event",
      badge: "Agenda Budaya",
      icon: Calendar,
      accentColor: "from-primary-700 to-primary-950",
    },
  ];

  return (
    <section className="py-20 bg-mist">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest text-secondary-600 font-bold block font-heading">
            Pilar Potensi Daerah
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-primary-950">
            Tiga Pesona Utama Purbalingga
          </h2>
          <p className="text-stone-600 text-sm font-body">
            Sentuh atau arahkan kursor ke pilar untuk melihat cuplikan kekayaan daerah.
          </p>
        </div>

        {/* Desktop View: Interactive 3 Expanding Pillars */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 items-stretch min-h-[460px]">
          {pillars.map((pillar, idx) => {
            const isActive = activeTab === idx;
            const Icon = pillar.icon;

            return (
              <div
                key={pillar.id}
                onMouseEnter={() => setActiveTab(idx)}
                onClick={() => setActiveTab(idx)}
                className={`group relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 cursor-pointer border ${
                  isActive
                    ? "bg-primary-800 text-white shadow-2xl scale-[1.02] border-secondary-500/50"
                    : "bg-white text-stone-900 hover:border-primary-700 hover:shadow-lg border-stone-200"
                }`}
              >
                {/* Number & Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-editorial text-4xl font-bold transition-colors ${
                        isActive ? "text-secondary-400" : "text-stone-300"
                      }`}
                    >
                      {pillar.number}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-white/10 text-secondary-400"
                          : "bg-stone-100 text-stone-600 group-hover:bg-primary-50 group-hover:text-primary-800"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3
                    className={`font-editorial text-2xl font-bold tracking-tight uppercase transition-colors ${
                      isActive ? "text-white" : "text-stone-900 group-hover:text-primary-800"
                    }`}
                  >
                    {pillar.title}
                  </h3>
                </div>

                {/* Bingkai kapsul: foto dinamis dari item unggulan/terbaru kategori ini */}
                <div className="my-6 flex justify-center items-center">
                  <PillarFrame
                    image={content[idx].image}
                    alt={content[idx].imageAlt}
                    icon={Icon}
                    badge={pillar.badge}
                    active={isActive}
                    accent={pillar.accentColor}
                    className="w-40 h-52 rounded-[64px]"
                    sizes="160px"
                  />
                </div>

                {/* Description & Link */}
                <div className="space-y-4">
                  <p
                    className={`text-xs leading-relaxed line-clamp-3 transition-colors ${
                      isActive ? "text-stone-200" : "text-stone-600"
                    }`}
                  >
                    {content[idx].description}
                  </p>

                  <Link
                    href={pillar.href}
                    className={`inline-flex items-center text-xs font-semibold gap-1.5 transition-colors ${
                      isActive
                        ? "text-secondary-400 hover:text-secondary-300"
                        : "text-primary-800 hover:text-primary-900"
                    }`}
                  >
                    <span>Eksplorasi {pillar.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View: High-Performance Touch Tabs & Card */}
        <div className="md:hidden space-y-4">
          <div className="grid grid-cols-3 gap-2 bg-stone-200/60 p-1 rounded-2xl">
            {pillars.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === idx
                    ? "bg-primary-800 text-white shadow-md"
                    : "text-stone-700 hover:bg-white/60"
                }`}
              >
                {p.number} {p.title.split(" ")[0]}
              </button>
            ))}
          </div>

          {(() => {
            const current = pillars[activeTab];
            const Icon = current.icon;
            return (
              <div className="bg-primary-800 text-white rounded-3xl p-6 border border-secondary-400/40 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-editorial text-3xl font-bold text-secondary-400">
                      {current.number}
                    </span>
                    <h3 className="font-editorial text-xl font-bold uppercase mt-1">
                      {current.title}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-secondary-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex justify-center">
                  <PillarFrame
                    image={content[activeTab].image}
                    alt={content[activeTab].imageAlt}
                    icon={Icon}
                    badge={current.badge}
                    active
                    accent={current.accentColor}
                    className="w-40 h-52 rounded-[56px]"
                    sizes="160px"
                  />
                </div>

                <p className="text-xs text-stone-200 leading-relaxed text-center font-body">
                  {content[activeTab].description}
                </p>

                <Link
                  href={current.href}
                  className="w-full py-3 rounded-xl bg-secondary-500 hover:bg-secondary-400 text-primary-950 text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Buka Halaman {current.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
