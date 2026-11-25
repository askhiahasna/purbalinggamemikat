import { getSiteSettings } from "@/server/queries/settings";
import { getPublishedDestinations } from "@/server/queries/destinations";
import { getPublishedCulinary } from "@/server/queries/content";
import { getHomeStats } from "@/server/queries/stats";
import type { HeroDestination } from "@/components/public/hero-slider";
import { HeroSlider } from "@/components/public/hero-slider";
import { MarqueeBanner } from "@/components/public/marquee-banner";
import { AboutSection } from "@/components/public/about-section";
import { InteractivePillars } from "@/components/public/interactive-pillars";
import { HighlightDestinasi } from "@/components/public/highlight-destinasi";
import { HighlightKuliner } from "@/components/public/highlight-kuliner";
import { HighlightEvent } from "@/components/public/highlight-event";
import { StatsSection } from "@/components/public/stats-section";
import { NewsSection } from "@/components/public/news-section";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { websiteLd } from "@/lib/structured-data";
import { DEFAULT_DESCRIPTION, pageMetadata } from "@/lib/seo";

// Konten berasal dari PostgreSQL (CMS) — dirender per-request, bukan saat build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({ description: DEFAULT_DESCRIPTION, path: "/" });

export default async function HomePage() {
  const [settings, destinations, culinary, stats] = await Promise.all([
    getSiteSettings(),
    getPublishedDestinations(),
    getPublishedCulinary(),
    getHomeStats(),
  ]);

  // Carousel hero: destinasi unggulan (isFeatured) lebih dulu, lalu sisanya; maks. 6.
  const heroDestinations: HeroDestination[] = destinations.slice(0, 6).map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    category: d.categoryLabel,
    district: d.district,
    desc: d.summary,
    coverUrl: d.coverUrl,
    coverGradient: d.coverGradient,
  }));

  // Gambar kartu statistik: unggahan admin; jika kosong, foto dari konten (urutan semantik, lalu bergilir).
  const pool = [...new Set([...destinations.map((d) => d.coverUrl), ...culinary.map((c) => c.imageUrl)].filter((u): u is string => !!u))];
  const coverOf = (cat: string) => destinations.find((d) => d.category === cat && d.coverUrl)?.coverUrl ?? null;
  const semantic = [
    destinations.find((d) => d.coverUrl)?.coverUrl ?? null,
    coverOf("sejarah-budaya"),
    culinary.find((c) => c.imageUrl)?.imageUrl ?? null,
    coverOf("desa-wisata"),
  ];
  const statImages = [settings.statImage1Url, settings.statImage2Url, settings.statImage3Url, settings.statImage4Url].map(
    (uploaded, i) => uploaded || semantic[i] || (pool.length ? pool[i % pool.length] : null)
  );

  return (
    <div className="flex flex-col w-full">
      <JsonLd data={websiteLd(settings.logoUrl)} />
      {/* 1. HERO SLIDER */}
      <HeroSlider settings={settings} destinations={heroDestinations} />

      {/* 2. SAMBUTAN BUPATI & WAKIL BUPATI (langsung setelah Hero) */}
      <AboutSection settings={settings} />

      {/* 3. TICKER DARI CMS (AYO DOLAN PURBALINGGA!) */}
      <MarqueeBanner />

      {/* 4. THREE INTERACTIVE PILLARS: 01 WISATA, 02 KULINER, 03 ACARA MENDATANG */}
      <InteractivePillars />

      {/* 4. HIGHLIGHT 01: WISATA PILIHAN */}
      <HighlightDestinasi />

      {/* 5. HIGHLIGHT 02: KULINER KHAS FAVORIT */}
      <HighlightKuliner />

      {/* 6. HIGHLIGHT 03: ACARA & FESTIVAL MENDATANG */}
      <HighlightEvent />

      {/* 8. STATISTIK PURBALINGGA MEMIKAT */}
      <StatsSection stats={stats} images={statImages} />

      {/* 9. BERITA & WARTA TERKINI */}
      <NewsSection />
    </div>
  );
}
