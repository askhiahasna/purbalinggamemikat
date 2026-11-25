import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { getPublishedDestinations } from "@/server/queries/destinations";
import { formatRupiah } from "@/lib/utils";
import { WishlistButton } from "@/components/public/wishlist";
import { CoverImage } from "@/components/ui/cover-image";

export async function HighlightDestinasi() {
  const featured = await getPublishedDestinations({ featuredOnly: true, take: 3 });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5" data-reveal="fade">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-secondary-600 font-bold block font-heading">
              Highlight 01 • Wisata
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-primary-950">
              Destinasi Wisata Pilihan
            </h2>
            <p className="text-stone-600 text-sm font-body">
              Objek rekreasi alam dan wahana populer paling favorit dikunjungi wisatawan.
            </p>
          </div>
          <Link
            href="/destinasi"
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-primary-800 hover:text-secondary-600 transition-colors"
          >
            Lihat Semua 50+ Destinasi
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-800 transition-all duration-300 flex flex-col justify-between" data-reveal
            >
              <div>
                <div className={`h-52 bg-gradient-to-t ${item.coverGradient} p-4 flex flex-col justify-between relative isolate overflow-hidden`}>
                  <CoverImage src={item.coverUrl} alt={item.name} />
                  <WishlistButton slug={item.slug} name={item.name} className="absolute bottom-3 right-3 z-20" />
                  <div className="flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-xs text-[11px] font-semibold text-secondary-300 border border-white/10">
                      {item.categoryLabel}
                    </span>
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded text-amber-300 text-xs font-bold border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  <div className="z-10">
                    <span className="bg-white text-primary-950 font-bold text-xs px-3 py-1 rounded shadow">
                      Mulai {formatRupiah(item.ticketWeekday)}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-secondary-500 shrink-0" />
                    <span>Kecamatan {item.district}</span>
                  </div>

                  <h3 className="font-editorial text-xl font-bold text-stone-900 group-hover:text-primary-800 transition-colors">
                    {item.name}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-body">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-3">
                <span className="text-stone-500">{item.openingHours}</span>
                <Link
                  href={`/destinasi/${item.slug}`}
                  className="font-semibold text-secondary-600 group-hover:text-secondary-700 hover:underline flex items-center gap-1"
                >
                  Detail & Tiket <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
