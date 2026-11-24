import type { Metadata } from "next";
import { getPublishedDestinations } from "@/server/queries/destinations";
import { DestinationCatalog } from "@/components/public/destination-catalog";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, itemListLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

// Konten berasal dari PostgreSQL (CMS) — dirender per-request, bukan saat build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Destinasi Wisata Purbalingga",
  description:
    "Jelajahi destinasi wisata alam, wisata air, desa wisata, sejarah, dan taman rekreasi di Kabupaten Purbalingga lengkap dengan tiket, jam buka, dan lokasi.",
  path: "/destinasi",
});

export default async function DestinasiCatalogPage() {
  const destinations = await getPublishedDestinations();
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
      <DestinationCatalog destinations={destinations} />
    </>
  );
}
