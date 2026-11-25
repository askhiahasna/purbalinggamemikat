import Image from "next/image";
import { UserCheck, Award, MapPin, Landmark } from "lucide-react";
import { SiteSettings } from "@/lib/data/cms-store";

/** Sambutan Bupati & Wakil Bupati — langsung setelah Hero; latar hijau solid #174C3C menyatu dengan dasar Hero. */
export function AboutSection({ settings }: { settings: SiteSettings }) {
  return (
    <section id="sambutan" aria-labelledby="sambutan-judul" className="relative bg-primary-800 text-white pt-6 pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(215,169,75,0.12),transparent_55%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        <div className="text-center space-y-2">
          <span className="font-brand text-xs sm:text-sm uppercase tracking-widest px-3 py-1 rounded-full bg-secondary-500 text-primary-950 font-normal shadow-xs">
            Sambutan
          </span>
          <h2 id="sambutan-judul" className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-1">
            {settings.sekilasTitle || "Sekilas Purbalingga"}
          </h2>
          <div className="w-16 h-1 bg-secondary-500 mx-auto rounded-full mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center" data-reveal>
          {/* Kiri: sambutan */}
          <div className="lg:col-span-7 space-y-6 text-white font-body text-sm sm:text-base leading-relaxed">
            <blockquote className="border-l-4 border-secondary-500 pl-4 sm:pl-5">
              <p className="font-editorial text-xl sm:text-2xl text-white leading-snug">&ldquo;{settings.sekilasQuote}&rdquo;</p>
              <footer className="mt-2 text-xs sm:text-sm text-secondary-200 font-semibold font-heading">
                {settings.leader1Name}, {settings.leader1Title} &nbsp;•&nbsp; {settings.leader2Name}, {settings.leader2Title}
              </footer>
            </blockquote>

            <p className="text-stone-100">
              <strong className="text-white font-heading font-semibold text-base sm:text-lg block mb-1">Kabupaten Purbalingga</strong>
              merupakan daerah yang kaya akan potensi alam, pesona budaya, dan tradisi luhur yang terletak strategis di <strong className="text-white">Kawasan Kaki Gunung Slamet</strong>, Jawa Tengah bagian barat daya.
            </p>
            <p className="text-stone-100">
              Dianugerahi hawa sejuk pegunungan, ratusan mata air jernih, bentang perbukitan asri, serta aliran legendaris Sungai Klawing yang tersohor, Purbalingga menjadi rumah bagi ragam destinasi unggulan: mulai dari agrowisata dataran tinggi, gua lava purba, hingga wahana rekreasi air ramah keluarga.
            </p>
            <p className="text-stone-100">
              Sebagai <em>Bumi Perwira</em>—tempat lahirnya Pahlawan Nasional Jenderal Besar Soedirman—masyarakat Purbalingga memegang teguh nilai gotong royong, integritas, keramahan bersahaja khas Banyumasan, dan daya cipta UMKM yang menggerakkan ekonomi kerakyatan.
            </p>

            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold">
              <div className="p-3 rounded-lg bg-primary-900 border border-primary-700/60 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary-400 shrink-0" />
                <span>18 Kecamatan</span>
              </div>
              <div className="p-3 rounded-lg bg-primary-900 border border-primary-700/60 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-secondary-400 shrink-0" />
                <span>Bumi Perwira</span>
              </div>
              <div className="p-3 rounded-lg bg-primary-900 border border-primary-700/60 flex items-center gap-2 col-span-2 sm:col-span-1">
                <Award className="w-4 h-4 text-secondary-400 shrink-0" />
                <span>Kearifan Lokal</span>
              </div>
            </div>
          </div>

          {/* Kanan: satu foto gabungan + label nama (bubble asimetris, mengambang halus) */}
          <div className="lg:col-span-5">
            <figure className="relative mx-auto max-w-md pb-10">
              <div className="relative aspect-[4/3] sm:aspect-[5/4] rounded-[2rem] overflow-hidden bg-primary-900 border-2 border-secondary-500/50 shadow-2xl">
                {settings.leadersPhotoUrl ? (
                  <Image
                    src={settings.leadersPhotoUrl}
                    alt={`${settings.leader1Title} ${settings.leader1Name} dan ${settings.leader2Title} ${settings.leader2Name}`}
                    fill
                    sizes="(min-width: 1024px) 38vw, 90vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-950 text-secondary-400/80">
                    <div className="w-24 h-24 rounded-full bg-secondary-500/15 border border-secondary-500/30 flex items-center justify-center">
                      <UserCheck className="w-12 h-12" aria-hidden="true" />
                    </div>
                  </div>
                )}
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary-950/70 to-transparent" />
              </div>

              <figcaption className="absolute left-3 right-3 bottom-0 flex items-end justify-between gap-3 pointer-events-none">
                <div className="animate-float max-w-[52%]">
                  <div className="bg-secondary-500 text-primary-950 px-4 py-2.5 rounded-[1.5rem_1.5rem_1.5rem_0.35rem] shadow-xl">
                    <p className="font-heading font-bold text-xs sm:text-sm leading-snug">{settings.leader1Name}</p>
                    <p className="text-[11px] font-semibold text-primary-900">{settings.leader1Title}</p>
                  </div>
                </div>
                <div className="animate-float-delayed max-w-[52%] mb-2">
                  <div className="bg-white text-primary-800 px-4 py-2.5 rounded-[1.5rem_1.5rem_0.35rem_1.5rem] shadow-xl">
                    <p className="font-heading font-bold text-xs sm:text-sm leading-snug">{settings.leader2Name}</p>
                    <p className="text-[11px] font-semibold text-primary-700">{settings.leader2Title}</p>
                  </div>
                </div>
              </figcaption>
            </figure>

            <p className="text-center text-[10px] text-secondary-200 uppercase tracking-widest mt-2 font-semibold font-heading">Pemerintah Kabupaten Purbalingga</p>
          </div>
        </div>
      </div>
    </section>
  );
}
