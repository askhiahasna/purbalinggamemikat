import { ShoppingBag, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPublishedBusinesses } from "@/server/queries/content";
import { CardPhoto } from "@/components/ui/cover-image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, itemListLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import { SectionHero } from "@/components/public/section/section-hero";
import { RecommendationSection } from "@/components/public/section/recommendations";
import { pickHero, tileIcon } from "@/components/public/section/helpers";
import { getSiteSettings } from "@/server/queries/settings";
import { slugify } from "@/lib/utils";

// Konten berasal dari PostgreSQL (CMS) — dirender per-request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "UMKM & Produk Unggulan Purbalingga",
  description:
    "Kenali UMKM dan produk unggulan Purbalingga: knalpot, bulu mata dan rambut palsu, batik, gula kelapa organik, kerajinan, dan banyak lagi.",
  path: "/umkm",
});

export default async function UmkmPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const [allUmkm, settings] = await Promise.all([getPublishedBusinesses(), getSiteSettings()]);
  const umkmList = kategori ? allUmkm.filter((u) => slugify(u.tag) === kategori) : allUmkm;
  const tags = [...new Set(allUmkm.map((u) => u.tag))].slice(0, 4);
  const recommended = [...allUmkm.filter((u) => u.imageUrl), ...allUmkm.filter((u) => !u.imageUrl)].slice(0, 4);

  return (
    <div>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Beranda", path: "/" },
            { name: "UMKM", path: "/umkm" },
          ]),
          itemListLd(
            "UMKM & Produk Unggulan Purbalingga",
            allUmkm.map((u) => ({ name: u.name, image: u.imageUrl, description: u.desc }))
          ),
        ]}
      />
      <SectionHero
        image={pickHero(settings.heroPageUmkm, allUmkm.find((u) => u.imageUrl)?.imageUrl, settings.heroBgUrl)}
        title={["UMKM", "Purbalingga"]}
        subtitle="Produk unggulan pelaku usaha lokal: dari knalpot, batik, hingga gula kelapa organik"
        tiles={tags.map((t) => ({ label: t, href: `/umkm?kategori=${slugify(t)}#katalog`, Icon: tileIcon(t, ShoppingBag) }))}
      />
      <RecommendationSection
        id="rekomendasi"
        title="Produk Unggulan Purbalingga"
        items={recommended.map((u) => ({ id: u.id, name: u.name, image: u.imageUrl, href: `/umkm#${u.id}` }))}
      />


      {/* 2. DIRECTORY UMKM */}
      <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-14 sm:py-20 scroll-mt-24">
        <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-secondary-600 font-bold block">
              Sentra Kreatif
            </span>
            <h2 className="font-editorial text-3xl font-bold text-primary-950 mt-1">
              Direktori Produk Unggulan Daerah
            </h2>
          </div>
          <span className="text-xs text-stone-500 hidden sm:inline">
            ✦ Menopang Ekonomi Kerakyatan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {umkmList.map((item) => (
            <div
              key={item.id}
              id={item.id}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-secondary-500 transition-all flex flex-col justify-between" data-reveal
            >
              <div className="space-y-4">
                <CardPhoto src={item.imageUrl} alt={item.name} />
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {item.tag}
                  </Badge>
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-editorial text-2xl font-bold text-stone-900 leading-snug">
                  {item.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-secondary-500 shrink-0" />
                  <span>Kawasan {item.district}</span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-body">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-1.5 mt-4">
                {item.features.map((f, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded-md"
                  >
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
