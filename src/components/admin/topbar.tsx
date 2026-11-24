import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL } from "@/lib/auth/permissions";
import type { SessionUser } from "@/server/auth/dal";

export function AdminTopbar({ user }: { user: SessionUser }) {
  return (
    <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Badge variant="primary" className="text-xs">
          {ROLE_LABEL[user.role]}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative text-stone-500 hover:text-stone-800 p-2 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-primary-700 text-white flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-stone-800">{user.name}</p>
            <p className="text-[10px] text-stone-500">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
