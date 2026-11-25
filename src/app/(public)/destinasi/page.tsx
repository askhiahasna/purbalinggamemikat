import type { Metadata } from "next";
import { Mountain } from "lucide-react";
import { getPublishedDestinations, getDestinationCategories } from "@/server/queries/destinations";
import { getSiteSettings } from "@/server/queries/settings";
import { DestinationCatalog } from "@/components/public/destination-catalog";
import { SectionHero } from "@/components/public/section/section-hero";
import { RecommendationSection } from "@/components/public/section/recommendations";
import { MiniMapSection } from "@/components/public/section/mini-map-section";
import { pickHero, tileIcon } from "@/components/public/section/helpers";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, itemListLd } from "@/lib/structured-data";
import { hasCoords } from "@/lib/geo";
import { pageMetadata } from "@/lib/seo";

// Konten berasal dari PostgreSQL (CMS) — dirender per-request, bukan saat build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Destinasi Wisata Purbalingga",
  description:
    "Jelajahi destinasi wisata alam, wisata air, desa wisata, sejarah, dan taman rekreasi di Kabupaten Purbalingga lengkap dengan tiket, jam buka, dan lokasi.",
  path: "/destinasi",
});

export default async function DestinasiCatalogPage({ searchParams }: { searchParams: Promise<{ kategori?: string; q?: string }> }) {
  const { kategori, q } = await searchParams;
  const [destinations, cats, settings] = await Promise.all([getPublishedDestinations(), getDestinationCategories(), getSiteSettings()]);
  const featured = destinations.filter((d) => d.coverUrl).slice(0, 4);
  const recommended = featured.length >= 4 ? featured : [...featured, ...destinations.filter((d) => !d.coverUrl)].slice(0, 4);
  const points = destinations
    .filter((d) => hasCoords(d.latitude, d.longitude))
    .map((d) => ({ lat: d.latitude, lng: d.longitude, kind: "destinasi" as const, name: d.name }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Beranda", path: "/" },
            { name: "Destinasi", path: "/destinasi" },
          ]),
          itemListLd(
            "Destinasi Wisata Purbalingga",
            destinations.map((d) => ({ name: d.name, path: `/destinasi/${d.slug}`, image: d.coverUrl, description: d.summary }))
          ),
        ]}
      />
      <SectionHero
        image={pickHero(settings.heroPageDestinasi, destinations.find((d) => d.coverUrl)?.coverUrl, settings.heroBgUrl)}
        title={["Jelajah", "Purbalingga"]}
        subtitle="Temukan keindahan alam, wisata air, gua vulkanik, hingga desa wisata asri di lereng Gunung Slamet"
        tiles={cats.slice(0, 5).map((c) => ({ label: c.name, href: `/destinasi?kategori=${c.slug}#katalog`, Icon: tileIcon(c.name, Mountain) }))}
      />
      <RecommendationSection
        id="rekomendasi"
        title="Rekomendasi Wisata di Purbalingga"
        items={recommended.map((d) => ({ id: d.id, name: d.name, image: d.coverUrl, href: `/destinasi/${d.slug}`, gradient: d.coverGradient }))}
      />
      <DestinationCatalog destinations={destinations} initialCategory={kategori ?? "semua"} initialQuery={q ?? ""} />
      <MiniMapSection
        heading="Titik Wisata Purbalingga"
        text="Lihat sebaran destinasi wisata di peta wilayah Kabupaten Purbalingga, lalu rencanakan rute kunjunganmu."
        points={points}
      />
    </>
  );
}
