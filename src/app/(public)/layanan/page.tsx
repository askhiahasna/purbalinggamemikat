import { MapPin, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ServiceForms } from "@/components/public/service-forms";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Layanan Publik & Kontak",
  description:
    "Sampaikan aspirasi dan pengaduan, daftarkan usaha atau desa wisata, isi survei kepuasan, serta temukan kontak TIC dan nomor darurat Purbalingga.",
  path: "/layanan",
});

export default function LayananPublikPage() {
  const emergencyContacts = [
    { title: "Tourist Information Center (TIC)", number: "(0281) 891001", note: "Disporapar Purbalingga" },
    { title: "Polres Purbalingga", number: "110 / (0281) 891110", note: "Layanan Darurat Kepolisian" },
    { title: "Pemadam Kebakaran (Damkar)", number: "(0281) 891113", note: "Pos Damkar Purbalingga" },
    { title: "RSUD dr. R. Goeteng Taroenadibrata", number: "(0281) 891016", note: "Instalasi Gawat Darurat" },
    { title: "Palang Merah Indonesia (PMI)", number: "(0281) 891080", note: "Layanan Ambulans & Darah" },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-primary-950 text-white pt-20 pb-28 sm:pt-28 sm:pb-36">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-900 to-teal-950/80 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,136,53,0.2),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4" data-reveal="fade">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs uppercase tracking-widest font-bold">
            ✦ Pelayanan Terpadu & Informasi
          </Badge>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Layanan Publik & Kontak <span className="text-secondary-400">Purbalingga</span>
          </h1>
          <p className="font-body text-sm sm:text-base text-stone-200 max-w-2xl mx-auto leading-relaxed">
            Saluran pengaduan masyarakat, pendaftaran mandiri pelaku usaha/desa wisata,
            survei kepuasan turis, kontak Tourist Information Center (TIC), dan nomor darurat.
          </p>
        </div>
      </section>

      {/* 2. FORM & LAYANAN INTERAKTIF */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Form selector & interactive form */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-md space-y-6">
            <ServiceForms />
          </div>

          {/* Right: Emergency Contacts & TIC */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-primary-950 text-white p-6 sm:p-8 rounded-3xl border border-secondary-400/40 shadow-xl space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-primary-900">
                <AlertTriangle className="w-5 h-5 text-secondary-400" />
                <h3 className="font-heading font-bold text-base text-white">
                  Nomor Darurat & Bantuan
                </h3>
              </div>

              <div className="space-y-3">
                {emergencyContacts.map((em, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-primary-900/80 border border-primary-800 space-y-0.5"
                  >
                    <p className="text-xs text-stone-300 font-semibold">{em.title}</p>
                    <p className="font-mono font-bold text-secondary-400 text-sm">{em.number}</p>
                    <p className="text-[10px] text-stone-400">{em.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <MapPin className="w-4 h-4 text-secondary-600" />
                <span>Pusat Informasi Turis (TIC)</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Kantor Disporapar Kabupaten Purbalingga, Kompleks GOR Goentoer Darjono, Purbalingga, Jawa Tengah.
              </p>
              <p className="text-stone-500 font-medium">Jam Pelayanan: Senin - Jumat, 08.00 - 15.30 WIB</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
