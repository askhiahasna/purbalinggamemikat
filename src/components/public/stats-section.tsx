import { MapPin, Landmark, Utensils, Hotel } from "lucide-react";
import { CoverImage } from "@/components/ui/cover-image";
import { CountUp } from "@/components/ui/count-up";

const CARD_STYLE = [
  { icon: MapPin, gradient: "from-emerald-900 to-teal-950" },
  { icon: Landmark, gradient: "from-stone-900 to-primary-950" },
  { icon: Utensils, gradient: "from-amber-950 to-primary-950" },
  { icon: Hotel, gradient: "from-teal-950 to-emerald-950" },
];

/** `stats`: angka nyata dari database (getHomeStats). `images`: satu URL per kartu (null = gradient). */
export function StatsSection({
  stats,
  images = [],
}: {
  stats: { value: number; label: string; subtext: string }[];
  images?: (string | null)[];
}) {
  return (
    <section className="py-20 bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest text-secondary-600 font-bold block">
            Capaian & Data Wilayah
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-primary-950">
            Statistik Purbalingga Memikat
          </h2>
          <p className="text-stone-600 text-sm font-body">
            Potensi dan capaian sektor pariwisata serta ekonomi kreatif Kabupaten Purbalingga.
          </p>
        </div>

        {/* 4 Cards Grid (2x2 on Mobile, 4x1 on Desktop - Matching Mockup) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" data-reveal="zoom">
          {stats.slice(0, 4).map((item, idx) => {
            const style = CARD_STYLE[idx];
            const Icon = style.icon;
            return (
              <div
                key={idx}
                className="group relative isolate rounded-2xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between text-white shadow-lg border border-white/10 transition-all duration-300 hover:scale-[1.03]"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />
                <CoverImage src={images[idx]} alt="" sizes="(min-width: 1024px) 25vw, 50vw" />
                {images[idx] && <div aria-hidden className="absolute inset-0 -z-10 bg-primary-950/55" />}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,136,53,0.15),transparent_60%)]" />

                {/* Subtle Icon Background */}
                <Icon className="absolute bottom-3 right-3 w-16 h-16 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none" />

                <div className="relative z-10 space-y-2">
                  <span className="font-editorial text-3xl sm:text-5xl font-bold text-secondary-400 tracking-tight block">
                    <CountUp value={item.value} />
                  </span>
                  <p className="font-heading font-semibold text-sm sm:text-base text-white">
                    {item.label}
                  </p>
                </div>

                <div className="relative z-10 pt-4 mt-4 border-t border-white/10 text-[11px] sm:text-xs text-stone-300">
                  {item.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
