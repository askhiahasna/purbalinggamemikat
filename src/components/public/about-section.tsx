import Image from "next/image";
import { UserCheck, Award, MapPin, Landmark } from "lucide-react";
import { SiteSettings } from "@/lib/data/cms-store";

export function AboutSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="bg-primary-800 text-white py-20 relative overflow-hidden">
      {/* Decorative subtle texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(215,169,75,0.1),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        <div className="text-center space-y-2">
          <span className="font-brand text-xs sm:text-sm uppercase tracking-widest px-3 py-1 rounded-full bg-secondary-500 text-white font-normal shadow-xs">
            {settings.siteName || "Purbalingga Memikat"}
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-1">
            {settings.sekilasTitle || "Sekilas Purbalingga"}
          </h2>
          <div className="w-16 h-1 bg-secondary-500 mx-auto rounded-full mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center" data-reveal>
          {/* Left Text: Geography, Culture, & Identity */}
          <div className="lg:col-span-7 space-y-6 text-stone-200 font-body text-sm sm:text-base leading-relaxed">
            <p>
              <strong className="text-white font-heading font-semibold text-base sm:text-lg block mb-1">
                Kabupaten Purbalingga
              </strong>
              merupakan daerah yang kaya akan potensi alam, pesona budaya, dan tradisi luhur yang terletak strategis di <strong>Kawasan Kaki Gunung Slamet</strong>, Jawa Tengah bagian barat daya.
            </p>
            <p>
              Dianugerahi hawa sejuk pegunungan, ratusan mata air jernih, bentang perbukitan asri, serta aliran legendaris Sungai Klawing yang tersohor, Purbalingga menjadi rumah bagi ragam destinasi unggulan: mulai dari agrowisata dataran tinggi, gua lava purba, hingga wahana rekreasi air ramah keluarga.
            </p>
            <p>
              Sebagai <em>Bumi Perwira</em>—tempat lahirnya Pahlawan Nasional Jenderal Besar Soedirman—masyarakat Purbalingga memegang teguh nilai gotong royong, integritas, keramahan bersahaja khas Banyumasan, dan daya cipta UMKM yang menggerakkan ekonomi kerakyatan.
            </p>

            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-primary-900 border border-primary-700/60 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary-500 shrink-0" />
                <span>18 Kecamatan</span>
              </div>
              <div className="p-3 rounded-lg bg-primary-900 border border-primary-700/60 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-secondary-500 shrink-0" />
                <span>Bumi Perwira</span>
              </div>
              <div className="p-3 rounded-lg bg-primary-900 border border-primary-700/60 flex items-center gap-2 col-span-2 sm:col-span-1">
                <Award className="w-4 h-4 text-secondary-500 shrink-0" />
                <span>Kearifan Lokal</span>
              </div>
            </div>
          </div>

          {/* Right: Leadership Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-gradient-to-b from-primary-900 to-primary-950 p-6 sm:p-8 rounded-3xl border border-secondary-500/30 shadow-2xl space-y-6 text-center">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: settings.leader1Name, title: settings.leader1Title, photo: settings.leader1PhotoUrl },
                  { name: settings.leader2Name, title: settings.leader2Title, photo: settings.leader2PhotoUrl },
                ].map((l, i) => (
                  <figure key={i} className="space-y-2">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-primary-900/80 border-2 border-secondary-500/40 shadow-inner">
                      {l.photo ? (
                        <Image
                          src={l.photo}
                          alt={`${l.title}: ${l.name}`}
                          fill
                          sizes="(min-width: 1024px) 18vw, 40vw"
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-secondary-400/80">
                          <div className="w-20 h-20 rounded-full bg-secondary-500/20 border border-secondary-500/30 flex items-center justify-center">
                            <UserCheck className="w-10 h-10" />
                          </div>
                        </div>
                      )}
                    </div>
                    <figcaption className="bg-primary-950/90 rounded-lg p-2.5 border border-primary-800">
                      <p className="font-heading font-bold text-xs sm:text-sm text-white leading-snug">{l.name}</p>
                      <p className="text-[11px] text-secondary-300 font-medium">{l.title}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>

              <div className="pt-2 border-t border-primary-800/80">
                <p className="text-xs text-stone-200 italic font-body">
                  &quot;{settings.sekilasQuote}&quot;
                </p>
                <p className="text-[10px] text-secondary-400 uppercase tracking-widest mt-1 font-semibold font-heading">
                  Pemerintah Kabupaten Purbalingga
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
