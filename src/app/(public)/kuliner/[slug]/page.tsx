import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, MapPin, Navigation, Tag } from "lucide-react";
import { getPublishedCulinary, getPublishedCulinaryBySlug } from "@/server/queries/content";
import { getSiteSettings } from "@/server/queries/settings";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { ShareButton } from "@/components/public/share-button";
import { SectionHero, splitTitle } from "@/components/public/section/section-hero";
import { RecommendationSection } from "@/components/public/section/recommendations";
import { MapPreview } from "@/components/public/section/map-preview";
import { pickHero } from "@/components/public/section/helpers";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, culinaryLd } from "@/lib/structured-data";
import { hasCoords } from "@/lib/geo";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getPublishedCulinaryBySlug(slug);
  if (!c) return { title: "Kuliner Tidak Ditemukan", robots: { index: false, follow: false } };
  return pageMetadata({
    title: `${c.name} - ${c.categoryLabel} di ${c.district}`,
    description: c.desc,
    path: `/kuliner/${c.id}`,
    image: c.imageUrl,
  });
}

export default async function KulinerDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, all, settings] = await Promise.all([getPublishedCulinaryBySlug(slug), getPublishedCulinary(), getSiteSettings()]);
  if (!item) notFound();

  const related = [...all.filter((c) => c.id !== item.id && c.category === item.category), ...all.filter((c) => c.id !== item.id && c.category !== item.category)].slice(0, 4);
  const located = hasCoords(item.latitude, item.longitude);
  const paragraphs = item.desc.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <JsonLd
        data={[
          culinaryLd(item),
          breadcrumbLd([
            { name: "Beranda", path: "/" },
            { name: "Kuliner", path: "/kuliner" },
            { name: item.name, path: `/kuliner/${item.id}` },
          ]),
        ]}
      />
      <SectionHero
        image={pickHero(item.imageUrl, settings.heroPageKuliner, settings.heroBgUrl)}
        title={splitTitle(item.name)}
        subtitle={`${item.categoryLabel} • Kec. ${item.district}`}
      />

      <section className="bg-white py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: "Kuliner", href: "/kuliner" }, { label: item.name }]} />
            <div className="flex items-center gap-2">
              <Link href="/kuliner" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-800 hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" /> Semua kuliner
              </Link>
              <ShareButton title={item.name} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
            <article className="lg:col-span-3 space-y-5">
              <h2 className="font-display font-semibold text-3xl sm:text-4xl text-primary-800">Tentang Kuliner Ini</h2>
              <div className="space-y-4 font-body text-stone-700 leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i} className="whitespace-pre-line break-words">
                    {p}
                  </p>
                ))}
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-sm">
                <li className="rounded-2xl border border-stone-200 bg-mist p-4 space-y-1">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5" /> Kisaran harga
                  </span>
                  <p className="font-heading font-bold text-primary-800">{item.priceRange}</p>
                </li>
                <li className="rounded-2xl border border-stone-200 bg-mist p-4 space-y-1">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    <BadgeCheck className="w-3.5 h-3.5" /> Status
                  </span>
                  <p className="font-heading font-bold text-primary-800">{item.isHalal ? "Halal" : "Non-halal"}</p>
                </li>
                <li className="rounded-2xl border border-stone-200 bg-mist p-4 space-y-1">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" /> Lokasi
                  </span>
                  <p className="font-heading font-bold text-primary-800 text-sm leading-snug">{item.address}</p>
                </li>
              </ul>
            </article>

            <aside className="lg:col-span-2 space-y-4">
              <MapPreview
                points={located ? [{ lat: item.latitude as number, lng: item.longitude as number, kind: "kuliner", name: item.name }] : []}
                href={located ? `/peta?kuliner=${encodeURIComponent(item.id)}` : "/peta"}
                label={`Lihat ${item.name} di peta`}
              />
              {located && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-secondary-500 px-5 py-3 text-sm font-heading font-bold text-primary-950 hover:bg-secondary-400 transition-colors"
                >
                  <Navigation className="w-4 h-4" /> Petunjuk Arah
                </a>
              )}
            </aside>
          </div>
        </div>
      </section>

      <RecommendationSection
        id="lainnya"
        title="Kuliner Lainnya"
        items={related.map((c) => ({ id: c.id, name: c.name, image: c.imageUrl, href: `/kuliner/${c.id}`, gradient: "from-amber-900 to-primary-900" }))}
      />
    </>
  );
}
