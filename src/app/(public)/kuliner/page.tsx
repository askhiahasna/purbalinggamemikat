import type { Metadata } from "next";
import { getPublishedCulinary, getCategoriesByType } from "@/server/queries/content";
import { getSiteSettings } from "@/server/queries/settings";
import { CulinaryCatalog } from "@/components/public/culinary-catalog";
import { SectionHero } from "@/components/public/section/section-hero";
import { RecommendationSection } from "@/components/public/section/recommendations";
import { MiniMapSection } from "@/components/public/section/mini-map-section";
import { pickHero, tileIcon } from "@/components/public/section/helpers";
import { Utensils } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, itemListLd } from "@/lib/structured-data";
import { hasCoords } from "@/lib/geo";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Kuliner Khas & Oleh-Oleh Purbalingga",
  description:
    "Daftar kuliner khas dan oleh-oleh Purbalingga: mendoan, soto kriyik, sate blater, nopia, dan lainnya lengkap dengan kisaran harga dan lokasi.",
  path: "/kuliner",
});

const slugOf = (s: string) => s.replace(/^kuliner-/, "");

export default async function KulinerPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const [items, cats, settings] = await Promise.all([getPublishedCulinary(), getCategoriesByType("CULINARY"), getSiteSettings()]);
  const categories = cats.map((c) => ({ id: slugOf(c.slug), label: c.name }));
  const hero = pickHero(settings.heroPageKuliner, items.find((i) => i.imageUrl)?.imageUrl, settings.heroBgUrl);

  // Rekomendasi: prioritas yang punya foto.
  const recommended = [...items.filter((i) => i.imageUrl), ...items.filter((i) => !i.imageUrl)].slice(0, 4);
  const points = items
    .filter((i) => hasCoords(i.latitude, i.longitude))
    .map((i) => ({ lat: i.latitude as number, lng: i.longitude as number, kind: "kuliner" as const, name: i.name }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Beranda", path: "/" },
            { name: "Kuliner", path: "/kuliner" },
          ]),
          itemListLd(
            "Kuliner Khas Purbalingga",
            items.map((c) => ({ name: c.name, path: `/kuliner/${c.id}`, image: c.imageUrl, description: c.desc }))
          ),
        ]}
      />
      <SectionHero
        image={hero}
        title={["Kuliner", "Purbalingga"]}
        subtitle="Nikmati cita rasa khas Purbalingga yang kaya akan tradisi dan budaya lokal"
        tiles={categories.slice(0, 4).map((c) => ({ label: c.label, href: `/kuliner?kategori=${c.id}#katalog`, Icon: tileIcon(c.label, Utensils) }))}
      />
      <RecommendationSection
        id="rekomendasi"
        title="Rekomendasi Kuliner di Purbalingga"
        items={recommended.map((i) => ({ id: i.id, name: i.name, image: i.imageUrl, href: `/kuliner/${i.id}`, gradient: "from-amber-900 to-primary-900" }))}
      />
      <CulinaryCatalog items={items} categories={categories} initialCategory={kategori ?? "semua"} />
      <MiniMapSection
        heading="Sentra & Titik Kuliner Purbalingga"
        text="Temukan lokasi pusat jajanan, sentra oleh-oleh, dan rumah makan legendaris langsung dari peta wilayah Kabupaten Purbalingga."
        points={points}
      />
    </>
  );
}
