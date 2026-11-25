import Link from "next/link";
import { BrandMark } from "@/components/public/brand-mark";
import { SocialLinks, type SocialMap } from "@/components/public/social-links";
import {
  MapPin,
  Phone,
  Mail,
  Send,
} from "lucide-react";

export function PublicFooter({
  siteName,
  tagline,
  logoUrl,
  socials,
}: {
  siteName: string;
  tagline: string;
  logoUrl?: string;
  socials: SocialMap;
}) {
  return (
    <footer className="relative bg-primary-950 text-stone-300 mt-auto overflow-hidden">
      {/* Layered Green Wavy Hills Transition (Directly inspired by Mockup Header) */}
      <div className="w-full overflow-hidden leading-none -mb-1">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 lg:h-24 block preserve-3d"
        >
          {/* Back Wave (Lighter Forest Green) */}
          <path
            d="M0,40 C320,110 480,10 720,50 C960,90 1120,20 1440,60 L1440,120 L0,120 Z"
            fill="#1B4D3E"
            opacity="0.6"
          />
          {/* Middle Wave (Medium Deep Green) */}
          <path
            d="M0,60 C240,15 480,95 720,40 C960,-15 1200,75 1440,30 L1440,120 L0,120 Z"
            fill="#0D382A"
            opacity="0.9"
          />
          {/* Front Wave (Darkest Tone matching footer body) */}
          <path
            d="M0,80 C360,20 720,100 1080,45 C1260,20 1380,60 1440,70 L1440,120 L0,120 Z"
            fill="#04140F"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Info & Newsletter (Col 1-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <BrandMark logoUrl={logoUrl} />
              <div>
                <span className="font-brand text-2xl tracking-wide text-white block leading-tight">{siteName}</span>
                <span className="text-xs uppercase tracking-widest text-secondary-300 font-semibold block font-heading">{tagline}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-body max-w-md">
              Jelajahi keindahan alam, kekayaan budaya, dan potensi daerah Kabupaten Purbalingga
              untuk pengalaman perjalanan yang tak terlupakan.
            </p>

            {/* Media sosial (dari Pengaturan CMS; disembunyikan bila kosong) */}
            <SocialLinks links={socials} siteName={siteName} className="pt-1" />

            {/* Newsletter Subscription Card (Matching Mockup) */}
            <div className="bg-primary-900/70 p-4 rounded-2xl border border-primary-800/80 max-w-md space-y-2">
              <p className="text-xs font-semibold text-white">Berlangganan Newsletter</p>
              <p className="text-[11px] text-stone-400">
                Dapatkan informasi terbaru seputar wisata dan event di Purbalingga.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="email"
                  placeholder="Masukkan email Anda..."
                  className="flex-1 bg-primary-950 px-3 py-2 rounded-xl text-xs text-white placeholder-stone-500 border border-primary-800 focus:outline-none focus:border-secondary-500"
                />
                <button
                  type="button"
                  aria-label="Kirim langganan"
                  className="w-8 h-8 rounded-xl bg-secondary-500 hover:bg-secondary-400 text-primary-950 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigasi Jelajahi (Col 6-7) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-wider text-secondary-400">
              Jelajahi Purbalingga
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/destinasi" className="text-stone-300 hover:text-secondary-400 transition-colors">
                  Destinasi Wisata
                </Link>
              </li>
              <li>
                <Link href="/kuliner" className="text-stone-300 hover:text-secondary-400 transition-colors">
                  Kuliner Khas
                </Link>
              </li>
              <li>
                <Link href="/budaya-event" className="text-stone-300 hover:text-secondary-400 transition-colors">
                  Budaya & Event
                </Link>
              </li>
              <li>
                <Link href="/umkm" className="text-stone-300 hover:text-secondary-400 transition-colors">
                  UMKM & Kerajinan
                </Link>
              </li>
              <li>
                <Link href="/investasi" className="text-stone-300 hover:text-secondary-400 transition-colors">
                  Ekonomi & Investasi
                </Link>
              </li>
              <li>
                <Link href="/profil" className="text-stone-300 hover:text-secondary-400 transition-colors">
                  Profil Daerah
                </Link>
              </li>
            </ul>
          </div>

          {/* Informasi Publik (Col 8-9) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-wider text-secondary-400">
              Informasi
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/berita" className="text-stone-300 hover:text-secondary-400 transition-colors">
                  Berita & Artikel
                </Link>
              </li>
              <li>
                <Link href="/destinasi" className="text-stone-300 hover:text-secondary-400 transition-colors">
                  Peta Wisata
                </Link>
              </li>
              <li>
                <Link href="/layanan" className="text-stone-300 hover:text-secondary-400 transition-colors">
                  Layanan Publik & Pengaduan
                </Link>
              </li>
              <li>
                <Link href="/layanan" className="text-stone-300 hover:text-secondary-400 transition-colors">
                  Survei Kepuasan Turis
                </Link>
              </li>
              <li>
                <Link href="/layanan" className="text-stone-300 hover:text-secondary-400 transition-colors">
                  Pusat Bantuan & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak & Lokasi (Col 10-12) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-wider text-secondary-400">
              Kontak Kami
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-secondary-400 shrink-0 mt-0.5" />
                <span>Jl. Jenderal Soedirman No. 1, Purbalingga, Jawa Tengah 53311</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-secondary-400 shrink-0" />
                <span>(0281) 891001</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary-400 shrink-0" />
                <span>info@purbalinggakab.go.id</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="border-t border-primary-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-4">
          <p>© 2026 Pemerintah Kabupaten Purbalingga. Hak Cipta Dilindungi.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/profil" className="hover:text-stone-200">
              Kebijakan Privasi
            </Link>
            <span>•</span>
            <Link href="/profil" className="hover:text-stone-200">
              Syarat & Ketentuan
            </Link>
            <span>•</span>
            <Link href="/profil" className="hover:text-stone-200">
              Aksesibilitas
            </Link>
            <span>•</span>
            <span className="text-secondary-400 font-medium">Bumi Perwira</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
