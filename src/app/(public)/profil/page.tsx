import { PURBALINGGA_DISTRICTS } from "@/lib/constants";
import { Landmark, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Profil Kabupaten Purbalingga",
  description:
    "Profil Kabupaten Purbalingga, Jawa Tengah: sejarah, geografi, wilayah kecamatan, dan potensi daerah di lereng Gunung Slamet.",
  path: "/profil",
});

export default function ProfilPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-primary-950 text-white pt-20 pb-28 sm:pt-28 sm:pb-36">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-teal-950/80 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,136,53,0.2),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4" data-reveal="fade">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs uppercase tracking-widest font-bold">
            ✦ Identitas & Sejarah Daerah
          </Badge>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Profil Kabupaten <span className="text-secondary-400">Purbalingga</span>
          </h1>
          <p className="font-body text-sm sm:text-base text-stone-200 max-w-2xl mx-auto leading-relaxed">
            Mengenal lebih dekat Bumi Perwira: sejarah cikal bakal Kadipaten, letak geografis
            lereng Gunung Slamet, kekayaan demografi, serta 18 kecamatan yang berdaya saing.
          </p>
        </div>
      </section>

      {/* 2. SEJARAH & GEOGRAFI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-secondary-500" />
              <h2 className="font-editorial text-2xl font-bold text-primary-950">
                Sejarah & Asal Usul Nama
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-body">
              Sejarah berdirinya Kabupaten Purbalingga berakar dari Kadipaten Onje yang didirikan oleh
              Kyai Korowelang di tepi Sungai Klawing pada abad ke-16. Seiring perjalanan sejarah,
              Pangeran Dipokusumo I memindahkan pusat pemerintahan ke wilayah Purbalingga pada tahun 1831.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-body">
              Julukan <strong>Bumi Perwira</strong> melekat erat karena Purbalingga merupakan tanah kelahiran
              Panglima Besar Jenderal Soedirman, pahlawan nasional yang memimpin perang gerilya kemerdekaan Indonesia.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-secondary-500" />
              <h2 className="font-editorial text-2xl font-bold text-primary-950">
                Letak Geografis & Iklim
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-body">
              Kabupaten Purbalingga berada di bagian barat daya Provinsi Jawa Tengah, berbatasan langsung dengan
              Kabupaten Pemalang di utara, Kabupaten Banjarnegara di timur dan selatan, serta Kabupaten Banyumas di barat.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-body">
              Topografi wilayah bervariasi dari dataran rendah subur hingga dataran tinggi berhawa sejuk di lereng timur
              Gunung Slamet (gunung tertinggi kedua di Pulau Jawa), dialiri oleh sungai-sungai utama seperti Sungai Klawing dan Sungai Serayu.
            </p>
          </div>
        </div>
      </section>

      {/* 3. 18 KECAMATAN DI KABUPATEN PURBALINGGA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-stone-200 pb-4">
          <span className="text-xs uppercase tracking-widest text-secondary-600 font-bold block">
            Wilayah Administratif
          </span>
          <h2 className="font-editorial text-3xl font-bold text-primary-950 mt-1">
            Direktori 18 Kecamatan
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Kabupaten Purbalingga terbagi ke dalam 18 kecamatan dengan potensi wisata dan UMKM yang khas.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PURBALINGGA_DISTRICTS.map((dist, idx) => (
            <div
              key={dist}
              className="bg-white p-4 rounded-xl border border-stone-200 text-center hover:border-primary-500 hover:shadow-md transition-all"
            >
              <span className="text-[10px] font-bold text-secondary-600 block">
                #{String(idx + 1).padStart(2, "0")}
              </span>
              <p className="font-heading font-semibold text-xs sm:text-sm text-stone-800 mt-1">
                Kec. {dist}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
