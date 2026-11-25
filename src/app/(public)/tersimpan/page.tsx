import type { Metadata } from "next";
import { getPublishedDestinations } from "@/server/queries/destinations";
import { SavedDestinations } from "@/components/public/saved-destinations";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Halaman personal (isi tergantung perangkat) — tidak untuk diindeks.
export const metadata: Metadata = pageMetadata({
  title: "Destinasi Tersimpan",
  description: "Daftar destinasi wisata Purbalingga yang kamu simpan di perangkat ini.",
  path: "/tersimpan",
  noIndex: true,
});

export default async function TersimpanPage() {
  const all = await getPublishedDestinations();
  return (
    <SavedDestinations
      all={all.map((d) => ({
        slug: d.slug,
        name: d.name,
        categoryLabel: d.categoryLabel,
        district: d.district,
        summary: d.summary,
        coverUrl: d.coverUrl,
        coverGradient: d.coverGradient,
        ticketWeekday: d.ticketWeekday,
        rating: d.rating,
      }))}
    />
  );
}
