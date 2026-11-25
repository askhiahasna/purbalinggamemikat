import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MapPreview, type PreviewPoint } from "./map-preview";

/** "Mini Peta Lokasi": judul, penjelasan + tombol, dan pratinjau peta berisi titik nyata dari CMS. */
export function MiniMapSection({
  heading,
  text,
  points,
  href = "/peta",
  cta = "Buka Peta Lengkap",
}: {
  heading: string;
  text: string;
  points: PreviewPoint[];
  href?: string;
  cta?: string;
}) {
  return (
    <section aria-labelledby="minipeta-judul" className="bg-white py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <h2 id="minipeta-judul" className="font-display font-semibold text-center text-3xl sm:text-5xl text-primary-800" data-reveal="fade">
          Mini Peta Lokasi
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center" data-reveal>
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-2xl sm:text-4xl text-stone-900 leading-tight">{heading}</h3>
            <p className="font-body text-sm sm:text-base text-stone-600 leading-relaxed">{text}</p>
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-800 px-5 py-3 text-sm font-heading font-semibold text-white hover:bg-primary-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"
            >
              {cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <MapPreview points={points} href={href} label={cta} />
        </div>
      </div>
    </section>
  );
}
