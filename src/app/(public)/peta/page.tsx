import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { getPublishedDestinations } from "@/server/queries/destinations";
import { getPublishedAccommodations } from "@/server/queries/accommodation";
import { getPublishedCulinary } from "@/server/queries/content";
import { InteractiveMap, type MapPoint } from "@/components/public/interactive-map";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd } from "@/lib/structured-data";
import { hasCoords } from "@/lib/geo";
import { priceRangeLabel } from "@/lib/contact";
import { formatRupiah } from "@/lib/utils";
import { truncate, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Peta Wisata & Penginapan Purbalingga",
  description:
    "Peta interaktif destinasi wisata dan penginapan di Purbalingga. Filter kategori dan kecamatan, cari berdasarkan nama, dan temukan yang paling dekat dengan lokasimu.",
  path: "/peta",
});

interface Props {
  searchParams: Promise<{ destinasi?: string; akomodasi?: string; kuliner?: string }>;
}

export default async function PetaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [destinations, accommodations, culinary] = await Promise.all([getPublishedDestinations(), getPublishedAccommodations(), getPublishedCulinary()]);

  const points: MapPoint[] = [
    ...destinations
      .filter((d) => hasCoords(d.latitude, d.longitude))
      .map<MapPoint>((d) => ({
        id: `d:${d.slug}`,
        kind: "destinasi",
        slug: d.slug,
        name: d.name,
        groupKey: d.category,
        groupLabel: d.categoryLabel,
        district: d.district,
        lat: d.latitude,
        lng: d.longitude,
        image: d.coverUrl,
        blurb: truncate(d.summary, 120),
        price: d.ticketWeekday > 0 ? `Tiket ${formatRupiah(d.ticketWeekday)}` : "Gratis / sesuai ketentuan",
        href: `/destinasi/${d.slug}`,
      })),
    ...accommodations
      .filter((a) => hasCoords(a.latitude, a.longitude))
      .map<MapPoint>((a) => ({
        id: `a:${a.slug}`,
        kind: "akomodasi",
        slug: a.slug,
        name: a.name,
        groupKey: a.type,
        groupLabel: a.typeLabel,
        district: a.district,
        lat: a.latitude as number,
        lng: a.longitude as number,
        image: a.imageUrl,
        blurb: truncate(a.description, 120),
        price: priceRangeLabel(a.priceFrom, a.priceTo) ? `${priceRangeLabel(a.priceFrom, a.priceTo)} / malam` : null,
        href: "/akomodasi",
      })),
    ...culinary
      .filter((c) => hasCoords(c.latitude, c.longitude))
      .map<MapPoint>((c) => ({
        id: `k:${c.id}`,
        kind: "kuliner",
        slug: c.id,
        name: c.name,
        groupKey: c.category,
        groupLabel: c.categoryLabel,
        district: c.district,
        lat: c.latitude as number,
        lng: c.longitude as number,
        image: c.imageUrl,
        blurb: truncate(c.desc, 120),
        price: c.priceRange !== "-" ? c.priceRange : null,
        href: `/kuliner/${c.id}`,
      })),
  ];

  const missing = destinations.length + accommodations.length + culinary.length - points.length;
  const focus = sp.kuliner ? { kind: "kuliner", slug: sp.kuliner } : sp.akomodasi ? { kind: "akomodasi", slug: sp.akomodasi } : sp.destinasi ? { kind: "destinasi", slug: sp.destinasi } : null;

  return (
    <div className="pb-16">
      <JsonLd
        data={breadcrumbLd([
          { name: "Beranda", path: "/" },
          { name: "Peta", path: "/peta" },
        ])}
      />
      <section className="relative overflow-hidden bg-primary-950 text-white pt-28 pb-10 sm:pt-32 sm:pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-teal-950/80 opacity-95" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2" data-reveal="fade">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-secondary-400 font-bold">
            <Compass className="w-4 h-4" /> Jelajah dengan Peta
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold">Peta Wisata, Penginapan & Kuliner</h1>
          <p className="text-sm text-stone-200 max-w-2xl">
            {points.length} lokasi di peta. Gunakan <strong>Dekat saya</strong> untuk mengurutkan berdasarkan jarak dari posisimu.
            {missing > 0 && <span className="text-stone-400"> ({missing} lokasi belum memiliki koordinat.)</span>}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {points.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center text-sm text-stone-500">
            Belum ada lokasi dengan koordinat. Tambahkan latitude/longitude pada destinasi atau akomodasi di CMS.
          </div>
        ) : (
          <InteractiveMap points={points} focus={focus} />
        )}
      </section>
    </div>
  );
}
