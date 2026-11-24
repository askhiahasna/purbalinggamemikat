import type { Metadata } from "next";
import { getPublishedCulinary } from "@/server/queries/content";
import { CulinaryCatalog } from "@/components/public/culinary-catalog";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, itemListLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Kuliner Khas & Oleh-Oleh Purbalingga",
  description:
    "Daftar kuliner khas dan oleh-oleh Purbalingga: mendoan, soto kriyik, sate blater, nopia, dan lainnya lengkap dengan kisaran harga dan lokasi.",
  path: "/kuliner",
});

export default async function KulinerPage() {
  const items = await getPublishedCulinary();
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
            items.map((c) => ({ name: c.name, image: c.imageUrl, description: c.desc }))
          ),
        ]}
      />
      <CulinaryCatalog culinaryItems={items} />
    </>
  );
}
