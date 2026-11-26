import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedArticleBySlug, getPublishedArticles } from "@/server/queries/content";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { ShareButton } from "@/components/public/share-button";
import { CoverImage } from "@/components/ui/cover-image";
import { articleLd, breadcrumbLd } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";

// Konten berasal dari PostgreSQL (CMS) — dirender per-request.
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getPublishedArticleBySlug(slug);
  if (!a) return { title: "Berita Tidak Ditemukan", robots: { index: false, follow: false } };
  return pageMetadata({
    title: a.title,
    description: a.excerpt,
    path: `/berita/${a.slug}`,
    image: a.coverImageUrl,
    type: "article",
    publishedTime: a.publishedISO,
    modifiedTime: a.modifiedISO,
  });
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;
  const [a, all] = await Promise.all([getPublishedArticleBySlug(slug), getPublishedArticles()]);
  if (!a) notFound();
  const related = [...all.filter((x) => x.id !== a.slug && x.category === a.category), ...all.filter((x) => x.id !== a.slug && x.category !== a.category)].slice(0, 3);

  // Isi berita adalah teks biasa: dipecah per paragraf dan dirender sebagai teks (tanpa HTML).
  const paragraphs = a.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <article className="pb-20">
      <JsonLd
        data={[
          articleLd(a),
          breadcrumbLd([
            { name: "Beranda", path: "/" },
            { name: "Berita", path: "/berita" },
            { name: a.title, path: `/berita/${a.slug}` },
          ]),
        ]}
      />

      <header className="relative overflow-hidden bg-primary-950 text-white pt-28 pb-20 sm:pt-32 sm:pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-teal-950/80 opacity-95" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Breadcrumbs tone="light" items={[{ label: "Beranda", href: "/" }, { label: "Berita", href: "/berita" }, { label: a.title }]} />
          <div>
            <Badge variant="secondary" className="text-[10px]">
              {a.category}
            </Badge>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">{a.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-secondary-400" />
              <time dateTime={a.publishedISO}>{a.dateLabel}</time>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-secondary-400" />
              {a.readTime} baca
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 space-y-8">
        {a.coverImageUrl && (
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-xl bg-stone-100">
            <Image src={a.coverImageUrl} alt={a.title} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        )}

        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 sm:p-10 space-y-5">
          <p className="font-body text-base sm:text-lg text-stone-700 leading-relaxed font-medium">{a.excerpt}</p>
          <hr className="border-stone-200" />
          <div className="space-y-4 font-body text-stone-700 leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line break-words">
                {p}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-stone-200">
            <Link href="/berita" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-800 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Semua berita
            </Link>
            <ShareButton title={a.title} />
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="berita-terkait" className="pt-6 space-y-5">
            <h2 id="berita-terkait" className="font-editorial text-2xl font-bold text-primary-950">
              Berita Lainnya
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/berita/${r.id}`}
                    className="group h-full bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md hover:border-primary-500 transition-all flex flex-col"
                  >
                    <div className="relative h-32 bg-gradient-to-br from-primary-900 to-primary-950 overflow-hidden">
                      <CoverImage src={r.imageUrl} alt={r.title} sizes="(min-width: 640px) 240px, 100vw" />
                    </div>
                    <div className="p-4 space-y-1.5 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-600">{r.category}</span>
                      <h3 className="font-heading font-bold text-sm text-stone-900 group-hover:text-primary-800 leading-snug line-clamp-3">{r.title}</h3>
                      <p className="text-[11px] text-stone-500">{r.date}</p>
                    </div>
                    <span className="px-4 pb-4 text-xs font-semibold text-primary-800 inline-flex items-center gap-1">
                      Baca <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
