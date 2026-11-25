"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, Globe, MapPin, Utensils, Calendar, Building2, Newspaper, ChevronRight } from "lucide-react";
import { WishlistNavLink } from "@/components/public/wishlist";
import { BrandMark } from "@/components/public/brand-mark";
import { SocialLinks, type SocialMap } from "@/components/public/social-links";
import { Button } from "@/components/ui/button";

// Posisi scroll sebagai sumber eksternal (tanpa setState di efek).
const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};
const scrolledSnapshot = () => window.scrollY > 24;

const NAV_LINKS = [
  { label: "Jelajah", href: "/destinasi", icon: MapPin },
  { label: "Peta", href: "/peta", icon: MapPin },
  { label: "Akomodasi", href: "/akomodasi", icon: Building2 },
  { label: "Kuliner", href: "/kuliner", icon: Utensils },
  { label: "Acara", href: "/budaya-event", icon: Calendar },
  { label: "Berita", href: "/berita", icon: Newspaper },
  { label: "Profil", href: "/profil", icon: Building2 },
];

export function PublicNavbar({ siteName, logoUrl, socials }: { siteName: string; logoUrl?: string; socials: SocialMap }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentLang, setCurrentLang] = React.useState<"IDN" | "ENG">("IDN");
  const scrolled = React.useSyncExternalStore(subscribeScroll, scrolledSnapshot, () => false);
  const pathname = usePathname();
  const router = useRouter();

  // Halaman yang bagian atasnya terang (bukan hero gelap): navbar solid & tidak menimpa konten.
  const lightTop = /^\/destinasi\/[^/]+$/.test(pathname);
  const solid = scrolled || mobileMenuOpen || searchOpen;
  const headerBg = lightTop ? "bg-primary-950 shadow-md" : solid ? "bg-black/60 backdrop-blur-md shadow-lg" : "bg-transparent";
  const shadowText = !lightTop && !solid ? "[text-shadow:0_1px_10px_rgb(0_0_0/0.55)]" : "";

  return (
    <>
      <header
        data-nav-state={lightTop ? "solid" : solid ? "scrolled" : "top"}
        className={`${lightTop ? "sticky" : "fixed inset-x-0"} top-0 z-50 w-full text-white transition-[background-color,box-shadow,backdrop-filter] duration-300 ${headerBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand / Logo — font Federo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label={`${siteName} — beranda`}>
            <BrandMark logoUrl={logoUrl} />
            <div>
              <span className={`font-brand text-xl sm:text-2xl tracking-wide text-white block leading-none ${shadowText}`}>{siteName}</span>
              <span className={`text-[10px] sm:text-xs uppercase tracking-widest text-secondary-300 font-semibold block mt-1 font-heading ${shadowText}`}>
                Bumi Perwira
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Navigasi utama">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${shadowText} ${
                    isActive ? "text-secondary-300 bg-white/10" : "text-white hover:text-secondary-300 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Aksi kanan: medsos, tersimpan, cari, bahasa, menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SocialLinks
              links={socials}
              siteName={siteName}
              className="hidden xl:flex"
              itemClassName="w-8 h-8 rounded-full text-white hover:bg-white/15 hover:text-secondary-300"
            />

            <WishlistNavLink />

            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Cari destinasi atau informasi"
              aria-expanded={searchOpen}
              className="p-2 rounded-lg text-white hover:text-secondary-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentLang(currentLang === "IDN" ? "ENG" : "IDN")}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/25 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <span className="w-3.5 h-2.5 rounded-xs overflow-hidden flex flex-col border border-white/30">
                <span className="bg-red-600 h-1/2 w-full" />
                <span className="bg-white h-1/2 w-full" />
              </span>
              <span>{currentLang}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Buka navigasi mobile"
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {searchOpen && (
          <div className="border-t border-white/15 bg-black/60 backdrop-blur-md px-4 py-3 sm:px-8 shadow-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/destinasi?q=${encodeURIComponent(searchQuery)}`);
                  setSearchOpen(false);
                }
              }}
              className="max-w-3xl mx-auto flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari destinasi wisata, kuliner mendoan, event, atau kecamatan..."
                  aria-label="Kata kunci pencarian"
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/25 rounded-lg text-sm text-white placeholder-stone-300 focus:outline-none focus:border-secondary-400"
                  autoFocus
                />
              </div>
              <Button type="submit" size="sm" variant="secondary">
                Cari
              </Button>
              <button type="button" onClick={() => setSearchOpen(false)} className="text-stone-200 hover:text-white p-2 text-xs cursor-pointer">
                Tutup
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed top-20 right-0 bottom-0 w-4/5 max-w-sm bg-primary-950 border-l border-primary-900/80 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="pb-4 border-b border-primary-900 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary-300">Menu Utama</span>
                <button
                  type="button"
                  onClick={() => setCurrentLang(currentLang === "IDN" ? "ENG" : "IDN")}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary-900 text-xs text-stone-100 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-secondary-300" />
                  <span>{currentLang}</span>
                </button>
              </div>

              <nav className="space-y-2" aria-label="Navigasi seluler">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center justify-between p-3 rounded-xl text-base font-medium transition-colors ${
                        isActive ? "bg-secondary-500 text-primary-950 font-bold" : "text-white hover:bg-primary-900/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? "text-primary-950" : "text-secondary-300"}`} />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? "text-primary-950" : "text-stone-300"}`} />
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-primary-900 space-y-3">
              <SocialLinks links={socials} siteName={siteName} className="justify-center" />
              <p className="text-[11px] text-center text-stone-400">{siteName} • 2026</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
