import Link from "next/link";
import { ArrowRight, Utensils, MapPin } from "lucide-react";
import { getPublishedCulinary } from "@/server/queries/content";
import { CoverImage } from "@/components/ui/cover-image";

export async function HighlightKuliner() {
  const kulinerHighlights = (await getPublishedCulinary(4)).map((c) => ({ name: c.name, district: c.district, price: c.priceRange, desc: c.desc, imageUrl: c.imageUrl }));

  return (
    <section className="py-20 bg-mist">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5" data-reveal="fade">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-secondary-600 font-bold block font-heading">
              Highlight 02 • Kuliner
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-primary-950">
              Kuliner Khas & Oleh-Oleh Favorit
            </h2>
            <p className="text-stone-600 text-sm font-body">
              Cita rasa otentik yang wajib dicicipi saat singgah di Kabupaten Purbalingga.
            </p>
          </div>
          <Link
            href="/kuliner"
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-primary-800 hover:text-secondary-600 transition-colors"
          >
            Jelajahi Menu Kuliner Lengkap
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kulinerHighlights.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-primary-800 transition-all duration-300" data-reveal
            >
              <div className="space-y-3">
                <div className="h-40 rounded-xl bg-gradient-to-br from-primary-900 to-primary-950 p-4 flex flex-col justify-between text-white relative isolate overflow-hidden">
                  <CoverImage src={item.imageUrl} alt={item.name} sizes="(min-width: 1024px) 25vw, 50vw" />
                  <span className="text-[10px] uppercase font-bold text-secondary-400 bg-black/40 px-2 py-0.5 rounded w-max">
                    Khas Purbalingga
                  </span>
                  <div className="flex items-center justify-between">
                    <Utensils className="w-8 h-8 text-secondary-400/80 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-bold text-emerald-300">Halal</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-secondary-500 shrink-0" />
                  <span>Kec. {item.district}</span>
                </div>

                <h3 className="font-heading font-bold text-base text-stone-900 group-hover:text-primary-800 transition-colors line-clamp-1">
                  {item.name}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-body">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs mt-3">
                <span className="font-bold text-primary-800">{item.price}</span>
                <Link
                  href="/kuliner"
                  className="font-semibold text-secondary-600 hover:underline flex items-center gap-1"
                >
                  Detail <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
