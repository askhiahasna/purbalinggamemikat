import { Newspaper, Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPublishedArticles } from "@/server/queries/content";
import { CoverImage } from "@/components/ui/cover-image";
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, itemListLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

// Konten berasal dari PostgreSQL (CMS) — dirender per-request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Berita & Artikel Purbalingga",
  description:
    "Kumpulan warta pembangunan daerah, liputan acara budaya, informasi pariwisata, dan kabar prestasi masyarakat Kabupaten Purbalingga.",
  path: "/berita",
});

export default async function BeritaPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="space-y-16 pb-20">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Beranda", path: "/" },
            { name: "Berita", path: "/berita" },
          ]),
          itemListLd(
            "Berita & Artikel Purbalingga",
            articles.map((a) => ({ name: a.title, path: `/berita/${a.id}`, image: a.imageUrl, description: a.desc }))
          ),
        ]}
      />
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-primary-950 text-white pt-20 pb-28 sm:pt-28 sm:pb-36">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-teal-950/80 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,136,53,0.2),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4" data-reveal="fade">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs uppercase tracking-widest font-bold">
            ✦ Kabar & Warta Resmi
          </Badge>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Berita & Artikel <span className="text-secondary-400">Purbalingga</span>
          </h1>
          <p className="font-body text-sm sm:text-base text-stone-200 max-w-2xl mx-auto leading-relaxed">
            Kumpulan warta pembangunan daerah, liputan acara budaya, informasi pariwisata,
            dan kabar prestasi masyarakat Kabupaten Purbalingga.
          </p>
        </div>
      </section>

      {/* 2. ARTICLES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
          <h2 className="font-editorial text-3xl font-bold text-primary-950">
            Arsip Warta Terkini
          </h2>
          <span className="text-xs text-stone-500">
            Menampilkan {articles.length} berita
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div
              key={art.id}
              className="relative bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-primary-500 transition-all flex flex-col justify-between overflow-hidden" data-reveal
            >
              <div>
                <div className="h-44 bg-gradient-to-br from-primary-900 to-primary-950 p-6 flex flex-col justify-between text-white relative isolate overflow-hidden">
                  <CoverImage src={art.imageUrl} alt={art.title} sizes="(min-width: 768px) 50vw, 100vw" />
                  <Badge variant="secondary" className="self-start text-[10px]">
                    {art.category}
                  </Badge>
                  <Newspaper className="w-10 h-10 text-secondary-400/50 self-end" />
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-secondary-500" />
                      {art.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {art.readTime}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-stone-900 hover:text-primary-800 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/berita/${art.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                      {art.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-body">
                    {art.desc}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-stone-100 flex items-center justify-end text-xs mt-3">
                <span className="text-secondary-600 font-semibold inline-flex items-center gap-1 group-hover:underline">
                  Baca Selengkapnya <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
