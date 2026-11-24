import Link from "next/link";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { getPublishedEvents } from "@/server/queries/content";

export async function HighlightEvent() {
  const upcomingEvents = await getPublishedEvents(3);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-5" data-reveal="fade">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-secondary-600 font-bold block font-heading">
              Highlight 03 • Acara Mendatang
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-primary-950">
              Agenda Acara & Festival Budaya
            </h2>
            <p className="text-stone-600 text-sm font-body">
              Kalender event pariwisata dan ritual budaya yang tak boleh Anda lewatkan.
            </p>
          </div>
          <Link
            href="/budaya-event"
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-primary-800 hover:text-secondary-600 transition-colors"
          >
            Lihat Kalender Event Penuh
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between hover:shadow-xl hover:border-primary-800 transition-all duration-300" data-reveal
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary-800 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-secondary-600 font-bold bg-secondary-50 px-3 py-1 rounded-full">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                </div>

                <h3 className="font-editorial text-2xl font-bold text-stone-900 group-hover:text-primary-800 transition-colors leading-snug">
                  {item.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-secondary-500 shrink-0" />
                  <span>{item.location}</span>
                </div>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-body">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs mt-4">
                <span className="text-stone-400">Tahun 2026</span>
                <Link
                  href="/budaya-event"
                  className="font-semibold text-secondary-600 hover:underline flex items-center gap-1"
                >
                  Detail Acara <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
