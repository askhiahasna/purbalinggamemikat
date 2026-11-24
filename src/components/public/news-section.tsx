import Link from "next/link";
import { ArrowRight, Calendar, Newspaper, Clock } from "lucide-react";
import { getPublishedArticles } from "@/server/queries/content";
import { CoverImage } from "@/components/ui/cover-image";

export async function NewsSection() {
  const news = (await getPublishedArticles(4)).map((a) => ({ ...a, readTime: `${a.readTime} baca` }));

  return (
    <section className="py-20 bg-mist">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-secondary-600 font-bold block">
              Kabar & Informasi
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-primary-950">
              Berita & Warta Terkini
            </h2>
          </div>
          <Link
            href="/berita"
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-primary-800 hover:text-secondary-600 transition-colors"
          >
            Lihat Semua Berita
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* News Grid (Matching Mockup with horizontal/card view) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 hover:shadow-lg hover:border-primary-500 transition-all flex flex-col sm:flex-row gap-5 items-start" data-reveal
            >
              {/* Thumbnail Container */}
              <div className="w-full sm:w-40 h-36 rounded-xl bg-gradient-to-br from-primary-900 to-primary-950 shrink-0 flex flex-col items-center justify-center text-secondary-400 p-4 text-center relative isolate overflow-hidden">
                <CoverImage src={item.imageUrl} alt={item.title} sizes="160px" />
                <Newspaper className="w-8 h-8 mb-2 text-secondary-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/40 px-2 py-0.5 rounded">
                  {item.category}
                </span>
              </div>

              {/* Text Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-secondary-500" />
                    {item.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {item.readTime}
                  </span>
                </div>

                <h3 className="font-heading font-semibold text-base text-stone-900 group-hover:text-primary-800 transition-colors line-clamp-2 leading-snug">
                  <Link href={`/berita/${item.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                    {item.title}
                  </Link>
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-body">
                  {item.desc}
                </p>

                <div className="pt-2">
                  <span className="text-xs font-semibold text-secondary-600 group-hover:underline inline-flex items-center gap-1">
                    Baca Selengkapnya <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
