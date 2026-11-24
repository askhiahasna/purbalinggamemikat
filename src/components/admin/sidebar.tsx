import Link from "next/link";
import { ADMIN_NAV_LINKS } from "@/lib/constants";
import { canAccessRoute, type AppRole } from "@/lib/auth/permissions";
import { logoutAction } from "@/server/actions/auth-actions";
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
  LogOut,
  ExternalLink,
} from "lucide-react";

export function AdminSidebar({ role, badges = {} }: { role: AppRole; badges?: Record<string, number> }) {
  const iconMap: Record<string, React.ReactNode> = {
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
  };

  return (
    <aside className="w-64 bg-primary-950 text-stone-300 flex flex-col shrink-0 border-r border-primary-900/60 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-primary-900/80">
        <Compass className="w-6 h-6 text-secondary-400" />
        <div>
          <span className="font-brand text-lg text-white tracking-wide block leading-tight">
            Purbalingga Memikat
          </span>
          <span className="text-[10px] uppercase tracking-wider text-secondary-400 font-semibold block font-heading">
            CMS Backoffice
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
          Menu Manajemen
        </div>
        {ADMIN_NAV_LINKS.filter((item) => canAccessRoute(role, item.href)).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-300 hover:text-white hover:bg-primary-800/60 transition-colors"
          >
            <span className="text-stone-400">{iconMap[item.icon] ?? <Compass className="w-4 h-4" />}</span>
            <span className="flex-1">{item.label}</span>
            {(badges[item.href] ?? 0) > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-secondary-500 text-primary-950 text-[10px] font-bold flex items-center justify-center">
                {badges[item.href]}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Footer / Shortcut */}
      <div className="p-4 border-t border-primary-900/80 space-y-2">
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
