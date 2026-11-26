import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Jejak halaman (Beranda › Menu › Halaman ini). Item terakhir ditandai sebagai halaman aktif.
 * `tone="light"` untuk latar gelap (hero), `"dark"` untuk latar terang.
 */
export function Breadcrumbs({ items, tone = "dark", className = "" }: { items: Crumb[]; tone?: "light" | "dark"; className?: string }) {
  const base = tone === "light" ? "text-stone-300" : "text-stone-600";
  const hover = tone === "light" ? "hover:text-white" : "hover:text-primary-700";
  const current = tone === "light" ? "font-semibold text-white" : "font-semibold text-primary-950";
  return (
    <nav aria-label="Jejak halaman" className={`${base} ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
              {c.href && !last ? (
                <Link href={c.href} className={`${hover} hover:underline transition-colors`}>
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={`truncate max-w-[220px] sm:max-w-md ${last ? current : ""}`}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight className="w-3 h-3 shrink-0 opacity-60" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
