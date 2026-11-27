"use client";

import * as React from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import type { AppRole } from "@/lib/auth/permissions";
import type { SessionUser } from "@/server/auth/dal";

/** Kerangka panel admin: sidebar (drawer di ponsel) + topbar + konten. */
export function AdminShell({
  user,
  badges,
  siteName,
  logoUrl,
  children,
}: {
  user: SessionUser;
  badges: Record<string, number>;
  siteName: string;
  logoUrl?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);

  // Esc menutup drawer; gulir halaman dikunci saat drawer terbuka.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-900 font-body">
      {open && <div aria-hidden="true" onClick={close} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden" />}
      <AdminSidebar role={user.role as AppRole} badges={badges} siteName={siteName} logoUrl={logoUrl} open={open} onClose={close} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar user={user} menuOpen={open} onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
