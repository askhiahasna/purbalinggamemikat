"use client";

import { useEffect } from "react";

/**
 * Animasi muncul saat di-scroll untuk elemen bertanda `data-reveal` (tanpa library, ±1 KB).
 * - Elemen yang masuk layar bersamaan muncul berurutan (jeda 70 ms, maks 5 langkah).
 * - Setelah selesai, atribut dilepas supaya transisi hover bawaan komponen kembali normal.
 * - Dimatikan otomatis bila pengguna memilih "kurangi gerakan" (prefers-reduced-motion).
 * - Tanpa JS, konten tetap tampil (CSS baru menyembunyikan setelah kelas `reveal-ready` dipasang).
 */
export function ScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    if (reduce || !("IntersectionObserver" in window)) {
      root.classList.remove("reveal-ready");
      return;
    }
    root.classList.add("reveal-ready");

    const seen = new WeakSet<Element>();
    const timers = new Set<number>();

    const io = new IntersectionObserver(
      (entries) => {
        let step = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          el.style.transitionDelay = `${Math.min(step, 5) * 70}ms`;
          step++;
          el.classList.add("is-visible");
          const t = window.setTimeout(() => {
            timers.delete(t);
            el.removeAttribute("data-reveal");
            el.classList.remove("is-visible");
            el.style.transitionDelay = "";
          }, 1100);
          timers.add(t);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    const observe = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      io.observe(el);
    };
    const scan = (node: ParentNode) => node.querySelectorAll("[data-reveal]").forEach(observe);

    scan(document);

    // Konten yang dirender belakangan (navigasi klien, filter katalog) ikut dianimasikan.
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.hasAttribute("data-reveal")) observe(n);
          scan(n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return null;
}
