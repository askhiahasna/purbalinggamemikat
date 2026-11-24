"use client";

import { useEffect, useRef } from "react";

/**
 * Angka naik halus saat terlihat di layar. Nilai akhir selalu ada di HTML server
 * (SEO/tanpa JS tetap benar); animasi dilewati bila pengguna memilih "kurangi gerakan".
 */
export function CountUp({ value, duration = 1100, className }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const node = el?.firstChild; // simpan node teks milik React; hanya ubah nodeValue-nya
    if (!el || !node || value <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        node.nodeValue = "0";
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          node.nodeValue = Math.round(value * eased).toLocaleString("id-ID");
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      node.nodeValue = value.toLocaleString("id-ID"); // pulihkan nilai akhir bila efek dilepas
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString("id-ID")}
    </span>
  );
}
