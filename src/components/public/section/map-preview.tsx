"use client";

import "leaflet/dist/leaflet.css";
import * as React from "react";
import Link from "next/link";
import type * as Leaflet from "leaflet";
import { MapPin } from "lucide-react";

export interface PreviewPoint {
  lat: number;
  lng: number;
  kind: "destinasi" | "akomodasi" | "kuliner";
  name: string;
}

const CENTER: [number, number] = [-7.39, 109.36];
const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Pratinjau peta tanpa interaksi (seluruh area adalah tautan ke peta lengkap). */
export function MapPreview({ points, href, label }: { points: PreviewPoint[]; href: string; label: string }) {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (points.length === 0) return;
    let cancelled = false;
    let map: Leaflet.Map | null = null;
    (async () => {
      const mod = await import("leaflet");
      if (cancelled || !boxRef.current) return;
      const L = ((mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet)) as typeof Leaflet;
      map = L.map(boxRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: true,
      }).setView(CENTER, 10);
      L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);
      for (const p of points) {
        const icon = L.divIcon({ className: "", html: `<div class="pm-marker pm-marker--${p.kind}"></div>`, iconSize: [30, 30], iconAnchor: [15, 30] });
        L.marker([p.lat, p.lng], { icon, interactive: false, keyboard: false }).addTo(map);
      }
      map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), { padding: [36, 36], maxZoom: 14 });
      setReady(true);
    })();
    return () => {
      cancelled = true;
      map?.remove();
      setReady(false);
    };
  }, [points]);

  return (
    <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-stone-200 shadow-lg bg-gradient-to-br from-primary-50 to-stone-100">
      {points.length > 0 ? (
        <div ref={boxRef} data-testid="map-preview" className="absolute inset-0 z-0" aria-hidden="true" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-500 text-xs text-center p-6">
          <MapPin className="w-8 h-8 text-primary-800/60" />
          Titik lokasi belum tersedia. Tambahkan koordinat di CMS agar tampil di peta.
        </div>
      )}
      {points.length > 0 && !ready && <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500">Memuat peta...</div>}
      <Link href={href} aria-label={label} className="absolute inset-0 z-[500] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary-800" />
    </div>
  );
}
