"use client";

import * as React from "react";
import { Share2, Check } from "lucide-react";

/**
 * Tombol bagikan. Di perangkat sentuh memakai lembar bagikan bawaan (WhatsApp, dll.);
 * di desktop menyalin tautan dengan umpan balik yang jelas.
 */
export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  const [state, setState] = React.useState<"idle" | "copied" | "error">("idle");

  const onClick = async () => {
    const url = window.location.href;
    try {
      const touch = window.matchMedia("(pointer: coarse)").matches;
      if (touch && typeof navigator.share === "function") {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return; // pengguna menutup lembar bagikan
      setState("error");
    }
    window.setTimeout(() => setState("idle"), 2200);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-xs cursor-pointer transition-colors ${className}`}
    >
      {state === "copied" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-600" />}
      <span aria-live="polite">{state === "copied" ? "Tautan tersalin" : state === "error" ? "Gagal menyalin" : "Bagikan"}</span>
    </button>
  );
}
