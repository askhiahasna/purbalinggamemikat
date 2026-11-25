"use client";

import * as React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { WISHLIST_EVENT, parseWishlist, readRaw, toggleSlug, writeList } from "@/lib/wishlist";

function subscribe(cb: () => void) {
  window.addEventListener(WISHLIST_EVENT, cb);
  window.addEventListener("storage", cb); // sinkron antar-tab
  return () => {
    window.removeEventListener(WISHLIST_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Daftar slug tersimpan. Di server/hidrasi awal selalu kosong, lalu menyesuaikan di klien (tanpa mismatch). */
export function useWishlist() {
  const raw = React.useSyncExternalStore(subscribe, readRaw, () => "[]");
  const list = React.useMemo(() => parseWishlist(raw), [raw]);
  const toggle = React.useCallback((slug: string) => writeList(toggleSlug(parseWishlist(readRaw()), slug)), []);
  const clear = React.useCallback(() => writeList([]), []);
  return { list, toggle, clear, has: (slug: string) => list.includes(slug) };
}

export function WishlistButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const { has, toggle } = useWishlist();
  const saved = has(slug);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Hapus ${name} dari destinasi tersimpan` : `Simpan ${name}`}
      title={saved ? "Hapus dari tersimpan" : "Simpan destinasi"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/45 backdrop-blur-xs border border-white/20 text-white hover:bg-black/65 transition-colors cursor-pointer ${className}`}
    >
      <Heart className={`w-4.5 h-4.5 transition-transform ${saved ? "fill-rose-500 text-rose-500 scale-110" : ""}`} />
    </button>
  );
}

/** Tautan ke /tersimpan dengan lencana jumlah. */
export function WishlistNavLink() {
  const { list } = useWishlist();
  return (
    <Link
      href="/tersimpan"
      aria-label={`Destinasi tersimpan (${list.length})`}
      className="relative p-2 rounded-lg text-stone-300 hover:text-white hover:bg-primary-900/60 transition-colors"
    >
      <Heart className="w-5 h-5" />
      {list.length > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-secondary-500 text-[10px] font-bold text-primary-950 flex items-center justify-center">
          {list.length}
        </span>
      )}
    </Link>
  );
}
