"use client";

import { Bell, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL } from "@/lib/auth/permissions";
import type { SessionUser } from "@/server/auth/dal";

export function AdminTopbar({ user, menuOpen, onMenu }: { user: SessionUser; menuOpen: boolean; onMenu: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Buka menu admin"
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
          className="lg:hidden -ml-2 p-2 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Badge variant="primary" className="text-xs truncate">
          {ROLE_LABEL[user.role]}
        </Badge>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative text-stone-500 hover:text-stone-800 p-2 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-xs shrink-0" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p className="text-xs font-semibold text-stone-800 truncate max-w-48">{user.name}</p>
            <p className="text-[10px] text-stone-500 truncate max-w-48">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
