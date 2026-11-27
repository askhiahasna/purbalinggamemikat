"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_LINKS } from "@/lib/constants";
import { canAccessRoute, type AppRole } from "@/lib/auth/permissions";
import { logoutAction } from "@/server/actions/auth-actions";
import { BrandMark } from "@/components/public/brand-mark";
import {
  Compass,
  LayoutDashboard,
  Settings,
  MapPin,
  Utensils,
  Calendar,
  ShoppingBag,
  Newspaper,
  MessageSquare,
  Users,
  Inbox,
  BedDouble,
  FileSpreadsheet,
  LogOut,
  ExternalLink,
  X,
} from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
  MapPin: <MapPin className="w-4 h-4" />,
  Utensils: <Utensils className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Newspaper: <Newspaper className="w-4 h-4" />,
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Inbox: <Inbox className="w-4 h-4" />,
  BedDouble: <BedDouble className="w-4 h-4" />,
  FileSpreadsheet: <FileSpreadsheet className="w-4 h-4" />,
};

/**
 * Sidebar admin. Di layar >= lg tampil tetap di kiri; di bawahnya menjadi drawer geser
 * yang dibuka lewat tombol hamburger di topbar.
 */
export function AdminSidebar({
  role,
  badges = {},
  siteName,
  logoUrl,
  open,
  onClose,
}: {
  role: AppRole;
  badges?: Record<string, number>;
  siteName: string;
  logoUrl?: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <aside
      id="admin-sidebar"
      aria-label="Menu admin"
      className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-primary-950 text-stone-300 flex flex-col border-r border-primary-900/60 transition-transform duration-300 ease-out motion-reduce:transition-none lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:max-w-none lg:translate-x-0 lg:shrink-0 ${
        open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}
    >
      {/* Brand Header: logo dari Pengaturan (fallback ikon kompas) */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-primary-900/80 shrink-0">
        <BrandMark logoUrl={logoUrl} className="w-9 h-9" />
        <div className="min-w-0 flex-1">
          <span className="font-brand text-base text-white block leading-tight truncate">{siteName}</span>
          <span className="text-[10px] uppercase tracking-wider text-secondary-400 font-semibold block font-heading">CMS Backoffice</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup menu"
          className="lg:hidden p-2 -mr-2 rounded-lg text-stone-300 hover:text-white hover:bg-primary-900 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto overscroll-contain" aria-label="Menu manajemen">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">Menu Manajemen</div>
        {ADMIN_NAV_LINKS.filter((item) => canAccessRoute(role, item.href)).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-primary-800 text-white" : "text-stone-300 hover:text-white hover:bg-primary-800/60"
              }`}
            >
              <span className={active ? "text-secondary-400" : "text-stone-400"}>{ICONS[item.icon] ?? <Compass className="w-4 h-4" />}</span>
              <span className="flex-1">{item.label}</span>
              {(badges[item.href] ?? 0) > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-secondary-500 text-primary-950 text-[10px] font-bold flex items-center justify-center">
                  {badges[item.href]}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Shortcut */}
      <div className="p-4 border-t border-primary-900/80 space-y-2 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-stone-400 hover:text-white hover:bg-primary-900/40 rounded-lg transition-colors"
        >
          <span>Lihat Web Publik</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
