import Link from "next/link";
import { BrandMark } from "@/components/public/brand-mark";
import { SocialLinks, isHttpUrl, type SocialMap } from "@/components/public/social-links";
import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export function PublicFooter({
  siteName,
  tagline,
  logoUrl,
  socials,
  contact,
}: {
  siteName: string;
  tagline: string;
  logoUrl?: string;
  socials: SocialMap;
  contact: { address: string; phone: string; email: string };
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Identitas, deskripsi singkat, media sosial */}
          <div className="space-y-5">
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
            <div className="space-y-2">
              {Object.values(socials).some(isHttpUrl) && (
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary-400 font-heading">Ikuti Kami</p>
              )}
              <SocialLinks links={socials} siteName={siteName} />
            </div>
          </div>

          {/* Kontak (dari Pengaturan CMS) */}
          {(contact.address || contact.phone || contact.email) && (
            <div className="space-y-3 md:justify-self-end md:max-w-sm w-full">
              <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-secondary-400">Kontak Kami</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
                {contact.address && (
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-secondary-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{contact.address}</span>
                  </li>
                )}
                {contact.phone && (
                  <li className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-secondary-400 shrink-0" aria-hidden="true" />
                    <span>{contact.phone}</span>
                  </li>
                )}
                {contact.email && (
                  <li className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-secondary-400 shrink-0" aria-hidden="true" />
                    <a href={`mailto:${contact.email}`} className="hover:text-secondary-300 transition-colors break-all">
                      {contact.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-primary-900 pt-5 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
          <p>© {new Date().getFullYear()} Pemerintah Kabupaten Purbalingga. Hak Cipta Dilindungi.</p>
          {/* Hanya halaman yang tidak ada di navbar (agar tetap dapat dijangkau) */}
          <nav aria-label="Tautan lainnya" className="flex items-center gap-4">
            <Link href="/umkm" className="hover:text-secondary-300 transition-colors">
              UMKM
            </Link>
            <Link href="/layanan" className="hover:text-secondary-300 transition-colors">
              Layanan Publik
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
