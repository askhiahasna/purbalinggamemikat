"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Search,
  Menu,
  X,
  Globe,
  MapPin,
  Utensils,
  Calendar,
  Building2,
  Newspaper,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentLang, setCurrentLang] = React.useState<"IDN" | "ENG">("IDN");
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { label: "Jelajah", href: "/destinasi", icon: MapPin },
    { label: "Kuliner", href: "/kuliner", icon: Utensils },
    { label: "Acara", href: "/budaya-event", icon: Calendar },
    { label: "Berita", href: "/berita", icon: Newspaper },
    { label: "Profil", href: "/profil", icon: Building2 },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-primary-950/90 text-white backdrop-blur-md border-b border-primary-900/60 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand / Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary-800 border border-secondary-400/40 flex items-center justify-center shadow-md group-hover:bg-primary-700 transition-colors">
              <Compass className="w-6 h-6 text-secondary-400" />
            </div>
            <div>
              <span className="font-brand text-xl sm:text-2xl tracking-wide text-white block leading-none">
                Purbalingga Memikat
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-secondary-400 font-medium block mt-1 font-heading">
                Bumi Perwira
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? "text-secondary-400 bg-primary-900/80 font-semibold"
                    : "text-stone-300 hover:text-white hover:bg-primary-900/40"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons (Search, Lang, CMS, Hamburger) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Cari destinasi atau informasi"
              className="p-2 rounded-lg text-stone-300 hover:text-white hover:bg-primary-900/60 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Selector */}
            <button
              type="button"
              onClick={() => setCurrentLang(currentLang === "IDN" ? "ENG" : "IDN")}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-900/70 border border-primary-800 text-xs font-semibold text-stone-200 hover:text-white hover:border-secondary-500/50 transition-colors cursor-pointer"
            >
              <span className="w-3.5 h-2.5 rounded-xs overflow-hidden flex flex-col border border-white/20">
                <span className="bg-red-600 h-1/2 w-full" />
                <span className="bg-white h-1/2 w-full" />
              </span>
              <span>{currentLang}</span>
            </button>

            {/* Admin CMS Access Link */}
            <Link href="/admin" className="hidden lg:inline-flex">
              <Button size="sm" variant="outline" className="border-secondary-500/60 text-secondary-300 hover:bg-secondary-500 hover:text-white text-xs">
                CMS
              </Button>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Buka navigasi mobile"
              className="md:hidden p-2 rounded-lg text-stone-200 hover:text-white hover:bg-primary-900/60 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {searchOpen && (
          <div className="border-t border-primary-900 bg-primary-950/95 px-4 py-3 sm:px-8 shadow-xl animate-in fade-in duration-150">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                   router.push(`/destinasi?q=${encodeURIComponent(searchQuery)}`);
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
                  className="w-full pl-10 pr-4 py-2 bg-primary-900/80 border border-primary-800 rounded-lg text-sm text-white placeholder-stone-400 focus:outline-none focus:border-secondary-500"
                  autoFocus
                />
              </div>
              <Button type="submit" size="sm" variant="secondary">
                Cari
              </Button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-stone-400 hover:text-white p-2 text-xs"
              >
                Tutup
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer (Responsive Navigation for Phones) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed top-20 right-0 bottom-0 w-4/5 max-w-sm bg-primary-950 border-l border-primary-900/80 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="pb-4 border-b border-primary-900 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary-400">
                  Menu Utama
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentLang(currentLang === "IDN" ? "ENG" : "IDN")}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary-900 text-xs text-stone-300"
                >
                  <Globe className="w-3.5 h-3.5 text-secondary-400" />
                  <span>{currentLang}</span>
                </button>
              </div>

              <nav className="space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl text-base font-medium transition-colors ${isActive
                        ? "bg-secondary-500 text-white font-semibold"
                        : "text-stone-200 hover:bg-primary-900/80"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-secondary-400" />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-primary-900 space-y-3">
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full border-primary-800 text-stone-200 hover:text-white">
                  CMS Backoffice (Admin)
                </Button>
              </Link>
              <p className="text-[11px] text-center text-stone-500">
                Purbalingga Memikat • Versi 2026
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
