import Link from "next/link";
import { CoverImage } from "@/components/ui/cover-image";

export interface RecItem {
  id: string;
  name: string;
  image: string | null;
  href: string;
  /** Kelas gradient bila belum ada foto. */
  gradient?: string;
}

/** Bagian hijau solid #174C3C berisi kartu foto tinggi dengan label kaca + tombol BUKA. */
export function RecommendationSection({ title, items, id }: { title: string; items: RecItem[]; id?: string }) {
  if (items.length === 0) return null;
  return (
    <section id={id} aria-labelledby={`${id ?? "rec"}-judul`} className="bg-primary-800 text-white py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <h2 id={`${id ?? "rec"}-judul`} className="font-display font-semibold text-center text-3xl sm:text-5xl [text-shadow:0_3px_16px_rgb(0_0_0/0.4)]" data-reveal="fade">
          {title}
        </h2>
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.slice(0, 4).map((it) => (
            <li key={it.id} data-reveal>
              <Link
                href={it.href}
                className={`group relative isolate block aspect-[3/4.4] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br ${it.gradient ?? "from-primary-700 to-primary-900"} shadow-xl`}
              >
                <CoverImage src={it.image} alt="" sizes="(min-width: 1024px) 22vw, 46vw" />
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/35 to-transparent" />
                <div className="absolute inset-x-2.5 bottom-2.5 sm:inset-x-3 sm:bottom-3 rounded-xl bg-black/45 backdrop-blur-md border border-white/15 px-3 py-3 text-center transition-colors group-hover:bg-black/60">
                  <p className="font-display font-medium text-base sm:text-lg leading-tight">{it.name}</p>
                  <span className="mt-2 inline-block rounded-full bg-white/85 px-5 py-0.5 text-[11px] font-heading font-bold tracking-wider text-primary-900 uppercase group-hover:bg-secondary-500">
                    Buka
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
