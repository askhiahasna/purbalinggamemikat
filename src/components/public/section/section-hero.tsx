import Image from "next/image";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export interface HeroTile {
  label: string;
  href: string;
  Icon: LucideIcon;
}

/** Judul dua baris seimbang untuk hero poster ("KULINER" / "PURBALINGGA"). */
export function splitTitle(text: string): [string, string] {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return [text, ""];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (diff < bestDiff) {
      best = i;
      bestDiff = diff;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/**
 * Hero halaman menu: foto penuh + judul poster besar (kapital condensed) + subjudul,
 * dengan deretan tile kategori menempel di dasar foto. Navbar transparan menimpa bagian atas.
 */
export function SectionHero({
  image,
  title,
  subtitle,
  tiles,
  eyebrow,
}: {
  image: string | null;
  title: [string, string?];
  subtitle?: string;
  tiles?: HeroTile[];
  eyebrow?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-primary-800 text-white">
      <div className="relative flex min-h-[440px] sm:min-h-[520px] flex-col justify-end">
        {image ? (
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover -z-20" />
        ) : (
          <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900/60" />
        )}
        {/* keterbacaan teks: gelap di kiri & atas (di bawah navbar) dan di dasar (tile) */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/55 via-black/10 to-black/10" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-transparent to-black/45" />

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8 sm:pb-10">
          {eyebrow && <p className="font-heading text-xs font-bold tracking-[0.25em] uppercase text-secondary-300 mb-3">{eyebrow}</p>}
          <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-wide [text-shadow:0_3px_20px_rgb(0_0_0/0.5)]">
            {title[0]}
            {title[1] && (
              <>
                <br />
                {title[1]}
              </>
            )}
          </h1>
          {subtitle && (
            <p className="font-display font-light text-base sm:text-xl leading-snug mt-3 max-w-xl [text-shadow:0_2px_14px_rgb(0_0_0/0.6)]">{subtitle}</p>
          )}
        </div>

        {tiles && tiles.length > 0 && (
          <nav aria-label="Kategori" className={`grid grid-cols-2 ${tiles.length >= 5 ? "lg:grid-cols-5" : tiles.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} border-t border-white/50`}>
            {tiles.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                className="group relative flex flex-col items-center gap-1.5 border-r border-b lg:border-b-0 border-white/50 bg-primary-800/75 hover:bg-primary-700/85 backdrop-blur-sm px-3 pt-4 pb-2.5 text-center transition-colors"
              >
                <t.Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={1.6} aria-hidden="true" />
                <span className="font-display font-semibold text-sm sm:text-lg leading-tight">{t.label}</span>
                <span className="self-end inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-display uppercase tracking-wide text-white/90 group-hover:text-secondary-300">
                  Lihat Selengkapnya <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
