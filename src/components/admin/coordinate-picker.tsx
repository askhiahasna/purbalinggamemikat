"use client";

import "leaflet/dist/leaflet.css";
import * as React from "react";
import type * as Leaflet from "leaflet";
import { LocateFixed, Map as MapIcon, Trash2, AlertCircle, Loader2 } from "lucide-react";

const CENTER: [number, number] = [-7.39, 109.36]; // pusat Kab. Purbalingga (perkiraan), hanya tampilan awal
// Perkiraan kotak wilayah Kab. Purbalingga — hanya untuk PERINGATAN lunak (tidak memblokir penyimpanan).
const BBOX = { minLat: -7.6, maxLat: -7.1, minLng: 109.1, maxLng: 109.6 };
const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const fmt = (n: number) => n.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
const parse = (s: string): number | null => {
  const t = s.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
};

/** Validasi tampilan (server tetap memvalidasi ulang). Mengembalikan pesan atau null. */
function problem(lat: number | null, lng: number | null): { level: "error" | "warn"; text: string } | null {
  if ((lat === null) !== (lng === null)) return { level: "error", text: "Isi latitude dan longitude bersamaan." };
  if (lat === null || lng === null) return null;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return { level: "error", text: "Koordinat harus berupa angka, contoh: -7.3482 dan 109.3512." };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { level: "error", text: "Koordinat di luar rentang (lat -90..90, lng -180..180)." };
  if (lat > 0) return { level: "warn", text: "Latitude positif berarti belahan bumi utara. Purbalingga berada di selatan (nilai negatif, ±-7)." };
  if (lat < BBOX.minLat || lat > BBOX.maxLat || lng < BBOX.minLng || lng > BBOX.maxLng) {
    return { level: "warn", text: "Titik ini tampaknya berada di luar wilayah Kabupaten Purbalingga. Pastikan sudah benar." };
  }
  return null;
}

export function CoordinatePicker({
  lat,
  lng,
  onChange,
  label = "Koordinat Lokasi",
}: {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [geoBusy, setGeoBusy] = React.useState(false);
  const [geoError, setGeoError] = React.useState("");
  const boxRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<Leaflet.Map | null>(null);
  const markerRef = React.useRef<Leaflet.Marker | null>(null);
  const LRef = React.useRef<typeof Leaflet | null>(null);
  const changeRef = React.useRef(onChange);
  React.useEffect(() => {
    changeRef.current = onChange;
  }, [onChange]);

  const pLat = parse(lat);
  const pLng = parse(lng);
  const valid = pLat !== null && pLng !== null && !Number.isNaN(pLat) && !Number.isNaN(pLng) && Math.abs(pLat) <= 90 && Math.abs(pLng) <= 180;
  const issue = problem(pLat, pLng);

  /* --- peta hanya dimuat saat dibuka (Leaflet hanya di browser) --- */
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const mod = await import("leaflet");
      if (cancelled || !boxRef.current) return;
      const L = ((mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet)) as typeof Leaflet;
      LRef.current = L;
      const map = L.map(boxRef.current, { scrollWheelZoom: true }).setView(CENTER, 10);
      L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);

      const place = (la: number, ln: number) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([la, ln]);
          return;
        }
        const icon = L.divIcon({ className: "", html: '<div class="pm-marker pm-marker--destinasi"></div>', iconSize: [30, 30], iconAnchor: [15, 30] });
        const marker = L.marker([la, ln], { icon, draggable: true, keyboard: true, title: "Seret untuk memindahkan titik" }).addTo(map);
        marker.on("dragend", () => {
          const p = marker.getLatLng();
          changeRef.current(fmt(p.lat), fmt(p.lng));
        });
        markerRef.current = marker;
      };

      map.on("click", (e: Leaflet.LeafletMouseEvent) => {
        place(e.latlng.lat, e.latlng.lng);
        changeRef.current(fmt(e.latlng.lat), fmt(e.latlng.lng));
      });

      // titik awal bila sudah ada koordinat
      const la = parse(lat);
      const ln = parse(lng);
      if (la !== null && ln !== null && !Number.isNaN(la) && !Number.isNaN(ln)) {
        place(la, ln);
        map.setView([la, ln], 15);
      }
      mapRef.current = map;
      (boxRef.current as HTMLDivElement & { __pmMap?: Leaflet.Map }).__pmMap = map; // pegangan untuk pengujian
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      setReady(false);
    };
    // Peta dibuat sekali per pembukaan; perubahan lat/lng ditangani efek di bawah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* --- ketikan manual pada input menggeser marker --- */
  React.useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;
    if (!valid) {
      if (pLat === null && pLng === null && markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }
    if (!markerRef.current) {
      const icon = L.divIcon({ className: "", html: '<div class="pm-marker pm-marker--destinasi"></div>', iconSize: [30, 30], iconAnchor: [15, 30] });
      const marker = L.marker([pLat!, pLng!], { icon, draggable: true, keyboard: true }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        changeRef.current(fmt(p.lat), fmt(p.lng));
      });
      markerRef.current = marker;
      map.setView([pLat!, pLng!], Math.max(map.getZoom(), 14));
    } else {
      const cur = markerRef.current.getLatLng();
      // Toleransi > galat pembulatan 6 desimal (±5e-7): klik/seret tidak boleh memicu geser peta.
      if (Math.abs(cur.lat - pLat!) > 2e-6 || Math.abs(cur.lng - pLng!) > 2e-6) {
        markerRef.current.setLatLng([pLat!, pLng!]);
        // Hanya geser peta bila titik hasil ketikan berada di luar area yang terlihat.
        if (!map.getBounds().pad(-0.1).contains([pLat!, pLng!])) map.panTo([pLat!, pLng!]);
      }
    }
  }, [ready, valid, pLat, pLng]);

  const locate = () => {
    setGeoError("");
    if (!("geolocation" in navigator)) return setGeoError("Lokasi tidak tersedia di perangkat/browser ini.");
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoBusy(false);
        onChange(fmt(pos.coords.latitude), fmt(pos.coords.longitude));
      },
      (err) => {
        setGeoBusy(false);
        setGeoError(err.code === err.PERMISSION_DENIED ? "Izin lokasi ditolak." : "Lokasi tidak tersedia (butuh HTTPS dan GPS/jaringan aktif).");
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  const inputCls = "w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-primary-800";

  return (
    <fieldset className="space-y-2">
      <legend className="block font-semibold text-stone-700 mb-1">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="coord-lat" className="block text-[11px] text-stone-500 mb-0.5">
            Latitude
          </label>
          <input id="coord-lat" type="text" inputMode="decimal" value={lat} onChange={(e) => onChange(e.target.value, lng)} placeholder="-7.3482" className={inputCls} />
        </div>
        <div>
          <label htmlFor="coord-lng" className="block text-[11px] text-stone-500 mb-0.5">
            Longitude
          </label>
          <input id="coord-lng" type="text" inputMode="decimal" value={lng} onChange={(e) => onChange(lat, e.target.value)} placeholder="109.3512" className={inputCls} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 font-semibold hover:bg-stone-50 cursor-pointer"
        >
          <MapIcon className="w-3.5 h-3.5" /> {open ? "Tutup peta" : "Pilih di peta"}
        </button>
        <button
          type="button"
          onClick={locate}
          disabled={geoBusy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 font-semibold hover:bg-stone-50 disabled:opacity-60 cursor-pointer"
        >
          {geoBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />} Lokasi saya
        </button>
        {(lat || lng) && (
          <button type="button" onClick={() => onChange("", "")} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" /> Hapus koordinat
          </button>
        )}
      </div>

      {open && (
        <div className="space-y-1">
          <div className="relative h-64 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
            <div ref={boxRef} role="application" aria-label="Peta untuk memilih titik lokasi" data-testid="coord-map" className="absolute inset-0 z-0" />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center text-stone-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Memuat peta...
              </div>
            )}
          </div>
          <p className="text-[11px] text-stone-400">Klik peta untuk menaruh titik, lalu seret pin untuk menggesernya. Koordinat terisi otomatis.</p>
        </div>
      )}

      {issue && (
        <p role={issue.level === "error" ? "alert" : "status"} className={`flex items-start gap-1.5 text-[11px] ${issue.level === "error" ? "text-rose-600" : "text-amber-700"}`}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {issue.text}
        </p>
      )}
      {geoError && (
        <p role="alert" className="flex items-start gap-1.5 text-[11px] text-amber-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {geoError}
        </p>
      )}
      <p className="text-[11px] text-stone-400">Opsional. Dipakai untuk peta, &quot;Dekat saya&quot;, dan data terstruktur. Kosongkan bila belum diketahui.</p>
    </fieldset>
  );
}
