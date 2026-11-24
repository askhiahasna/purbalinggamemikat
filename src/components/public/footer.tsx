import Link from "next/link";
import {
  Compass,
  MapPin,
  Phone,
  Mail,
  Send,
} from "lucide-react";

export function PublicFooter() {
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
              <div className="w-10 h-10 rounded-xl bg-primary-800 border border-secondary-400/40 flex items-center justify-center text-secondary-400 shadow-md">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="font-brand text-2xl tracking-wide text-white block leading-tight">
                  Purbalingga Memikat
                </span>
                <span className="text-xs uppercase tracking-widest text-secondary-400 font-medium block font-heading">
                  Pesona di Setiap Langkah
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-body max-w-md">
              Jelajahi keindahan alam, kekayaan budaya, dan potensi daerah Kabupaten Purbalingga
              untuk pengalaman perjalanan yang tak terlupakan.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram Purbalingga Memikat"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-secondary-500 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube Disporapar Purbalingga"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-secondary-500 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook Pemkab Purbalingga"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-secondary-500 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter Diskominfo Purbalingga"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-secondary-500 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

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
                  className="w-8 h-8 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
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
