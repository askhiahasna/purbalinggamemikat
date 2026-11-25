import type { Metadata } from "next";
import { BedDouble } from "lucide-react";
import { getPublishedAccommodations } from "@/server/queries/accommodation";
import { getSiteSettings } from "@/server/queries/settings";
import { AccommodationCatalog } from "@/components/public/accommodation-catalog";
import { SectionHero } from "@/components/public/section/section-hero";
import { RecommendationSection } from "@/components/public/section/recommendations";
import { MiniMapSection } from "@/components/public/section/mini-map-section";
import { pickHero, tileIcon } from "@/components/public/section/helpers";
import { JsonLd } from "@/components/seo/json-ld";
import { accommodationLd, breadcrumbLd } from "@/lib/structured-data";
import { hasCoords } from "@/lib/geo";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Akomodasi & Penginapan di Purbalingga",
  description:
    "Direktori hotel, homestay, villa, dan penginapan desa wisata di Purbalingga lengkap dengan tarif, fasilitas, kontak WhatsApp, dan lokasi di peta.",
  path: "/akomodasi",
});

export default async function AkomodasiPage({ searchParams }: { searchParams: Promise<{ jenis?: string }> }) {
  const { jenis } = await searchParams;
  const [items, settings] = await Promise.all([getPublishedAccommodations(), getSiteSettings()]);
  const types = [...new Map(items.map((i) => [i.type, i.typeLabel])).entries()].slice(0, 5);
  const recommended = [...items.filter((i) => i.imageUrl), ...items.filter((i) => !i.imageUrl)].slice(0, 4);
  const points = items
    .filter((i) => hasCoords(i.latitude, i.longitude))
    .map((i) => ({ lat: i.latitude as number, lng: i.longitude as number, kind: "akomodasi" as const, name: i.name }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Beranda", path: "/" },
            { name: "Akomodasi", path: "/akomodasi" },
          ]),
          ...items.map(accommodationLd),
        ]}
      />
      <SectionHero
        image={pickHero(settings.heroPageAkomodasi, items.find((i) => i.imageUrl)?.imageUrl, settings.heroBgUrl)}
        title={["Akomodasi", "Purbalingga"]}
        subtitle="Hotel, homestay, villa, dan penginapan desa wisata di sekitar destinasi"
        tiles={types.map(([v, l]) => ({ label: l, href: `/akomodasi?jenis=${v}#katalog`, Icon: tileIcon(l, BedDouble) }))}
      />
      <RecommendationSection
        id="rekomendasi"
        title="Rekomendasi Penginapan"
        items={recommended.map((i) => ({ id: i.id, name: i.name, image: i.imageUrl, href: `/akomodasi#${i.slug}`, gradient: "from-primary-700 to-primary-900" }))}
      />
      <AccommodationCatalog items={items} initialType={jenis ?? "semua"} />
      <MiniMapSection
        heading="Lokasi Penginapan di Purbalingga"
        text="Pilih penginapan terdekat dari destinasi tujuanmu dan lihat sebarannya langsung di peta."
        points={points}
      />
    </>
  );
}
