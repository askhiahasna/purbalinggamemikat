import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedDestinationBySlug,
  getPublishedDestinations,
} from "@/server/queries/destinations";
import { DestinationDetailView } from "@/components/public/destination-detail-view";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, destinationLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

// Konten berasal dari PostgreSQL (CMS) — dirender per-request, bukan saat build.
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getPublishedDestinationBySlug(slug);

  if (!destination) {
    return { title: "Destinasi Tidak Ditemukan", robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: `${destination.name} - Wisata ${destination.categoryLabel} di ${destination.district}`,
    description: destination.summary || destination.description,
    path: `/destinasi/${destination.slug}`,
    image: destination.coverUrl,
  });
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;
  const destination = await getPublishedDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  const all = await getPublishedDestinations();
  const nearby = all
    .filter(
      (d) =>
        d.slug !== destination.slug &&
        (d.district === destination.district || d.category === destination.category)
    )
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          destinationLd(destination),
          breadcrumbLd([
            { name: "Beranda", path: "/" },
            { name: "Destinasi", path: "/destinasi" },
            { name: destination.name, path: `/destinasi/${destination.slug}` },
          ]),
        ]}
      />
      <DestinationDetailView destination={destination} nearby={nearby} />
    </>
  );
}
