"use client";

import "leaflet/dist/leaflet.css";
import * as React from "react";
import Image from "next/image";
import type * as Leaflet from "leaflet";
import { Search, LocateFixed, Loader2, MapPin, RotateCcw, AlertCircle } from "lucide-react";
import { formatKm, haversineKm, type LatLng } from "@/lib/geo";
import { WishlistButton } from "./wishlist";

export interface MapPoint {
  id: string;
  kind: "destinasi" | "akomodasi" | "kuliner";
  slug: string;
  name: string;
  groupKey: string;
  groupLabel: string;
  district: string;
  lat: number;
  lng: number;
  image: string | null;
  blurb: string;
  price: string | null;
  href: string;
}

type Geo = "idle" | "loading" | "ok" | "denied" | "unavailable";
const CENTER: [number, number] = [-7.39, 109.36]; // pusat Kab. Purbalingga (perkiraan), hanya tampilan awal
const KIND_LABEL = { destinasi: "Destinasi", akomodasi: "Akomodasi", kuliner: "Kuliner" } as const;

// Tile default = server OSM (cocok untuk pengembangan/trafik kecil). Untuk produksi set NEXT_PUBLIC_MAP_TILE_URL
// ke penyedia tile berlisensi sesuai kebijakan penggunaan.
const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Isi popup dibuat lewat DOM + textContent (bukan innerHTML) agar nama/teks dari CMS tidak bisa menyuntik HTML. */
function buildPopup(p: MapPoint): HTMLElement {
  const root = document.createElement("div");
  root.className = "pm-popup";
  if (p.image) {
    const img = document.createElement("img");
    img.src = p.image;
    img.alt = "";
    img.loading = "lazy";
    root.append(img);
  }
  const title = document.createElement("strong");
  title.textContent = p.name;
  const meta = document.createElement("div");
  meta.className = "pm-popup-meta";
  meta.textContent = `${p.groupLabel} • Kec. ${p.district}`;
  root.append(title, meta);
  if (p.price) {
    const price = document.createElement("div");
    price.className = "pm-popup-price";
    price.textContent = p.price;
    root.append(price);
  }
  const links = document.createElement("div");
  links.className = "pm-popup-links";
  if (p.href.startsWith("/")) {
    const a = document.createElement("a");
    a.href = p.href;
    a.textContent = p.kind === "destinasi" ? "Lihat detail" : p.kind === "kuliner" ? "Lihat kuliner" : "Lihat penginapan";
    links.append(a);
  }
  const route = document.createElement("a");
  route.href = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
  route.target = "_blank";
  route.rel = "noopener noreferrer";
  route.textContent = "Petunjuk arah";
  links.append(route);
  root.append(links);
  return root;
}

export function InteractiveMap({ points, focus }: { points: MapPoint[]; focus?: { kind: string; slug: string } | null }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<Leaflet.Map | null>(null);
  const layerRef = React.useRef<Leaflet.LayerGroup | null>(null);
  const userLayerRef = React.useRef<Leaflet.LayerGroup | null>(null);
  const LRef = React.useRef<typeof Leaflet | null>(null);
  const markersRef = React.useRef<Map<string, Leaflet.Marker>>(new Map());
  const [ready, setReady] = React.useState(false);

  const [showKinds, setShowKinds] = React.useState({ destinasi: true, akomodasi: true, kuliner: true });
  const [group, setGroup] = React.useState("semua");
  const [district, setDistrict] = React.useState("semua");
  const [q, setQ] = React.useState("");
  const [radius, setRadius] = React.useState(0); // km; 0 = semua
  const [userPos, setUserPos] = React.useState<LatLng | null>(null);
  const [geo, setGeo] = React.useState<Geo>("idle");
  const [selected, setSelected] = React.useState<string | null>(null);

  const groups = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const p of points) m.set(`${p.kind}:${p.groupKey}`, `${KIND_LABEL[p.kind]} — ${p.groupLabel}`);
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [points]);
  const districts = React.useMemo(() => [...new Set(points.map((p) => p.district))].sort(), [points]);

  const visible = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const withDist = points
      .filter((p) => showKinds[p.kind])
      .filter((p) => group === "semua" || `${p.kind}:${p.groupKey}` === group)
      .filter((p) => district === "semua" || p.district === district)
      .filter((p) => !needle || `${p.name} ${p.district} ${p.groupLabel} ${p.blurb}`.toLowerCase().includes(needle))
      .map((p) => ({ p, km: userPos ? haversineKm(userPos, p) : null }))
      .filter((x) => !userPos || radius === 0 || (x.km ?? 0) <= radius);
    withDist.sort((a, b) => (a.km !== null && b.km !== null ? a.km - b.km : a.p.name.localeCompare(b.p.name)));
    return withDist;
  }, [points, showKinds, group, district, q, userPos, radius]);

  /* --- inisialisasi peta (Leaflet hanya dimuat di browser) --- */
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      const L = ((mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet)) as typeof Leaflet;
      LRef.current = L;
      const map = L.map(containerRef.current, { scrollWheelZoom: true }).setView(CENTER, 10);
      L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      userLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  /* --- marker mengikuti filter --- */
  React.useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !map || !layer) return;
    layer.clearLayers();
    markersRef.current.clear();
    for (const { p } of visible) {
      const icon = L.divIcon({
        className: "",
        html: `<div class="pm-marker pm-marker--${p.kind}"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28],
      });
      const marker = L.marker([p.lat, p.lng], { icon, title: p.name, keyboard: true }).bindPopup(buildPopup(p), { maxWidth: 260 });
      marker.on("click", () => setSelected(p.id));
      marker.addTo(layer);
      markersRef.current.set(p.id, marker);
    }
    if (visible.length && !userPos) {
      map.fitBounds(L.latLngBounds(visible.map(({ p }) => [p.lat, p.lng] as [number, number])), { padding: [48, 48], maxZoom: 14 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, visible.map((v) => v.p.id).join("|")]);

  /* --- posisi pengguna --- */
  React.useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = userLayerRef.current;
    if (!ready || !L || !map || !layer) return;
    layer.clearLayers();
    if (!userPos) return;
    L.circleMarker([userPos.lat, userPos.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }).bindTooltip("Lokasi Anda").addTo(layer);
    if (radius > 0) L.circle([userPos.lat, userPos.lng], { radius: radius * 1000, color: "#2563eb", weight: 1, fillOpacity: 0.05 }).addTo(layer);
    const near = visible.slice(0, 5).map(({ p }) => [p.lat, p.lng] as [number, number]);
    map.fitBounds(L.latLngBounds([[userPos.lat, userPos.lng], ...near]), { padding: [48, 48], maxZoom: 14 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, userPos, radius]);

  /* --- fokus dari tautan (?akomodasi=slug / ?destinasi=slug) --- */
  React.useEffect(() => {
    if (!ready || !focus) return;
    const p = points.find((x) => x.kind === focus.kind && x.slug === focus.slug);
    if (!p) return;
    const t = setTimeout(() => {
      setSelected(p.id);
      mapRef.current?.setView([p.lat, p.lng], 15);
      markersRef.current.get(p.id)?.openPopup();
    }, 50);
    return () => clearTimeout(t);
  }, [ready, focus, points]);

  const locate = () => {
    if (!("geolocation" in navigator)) return setGeo("unavailable");
    setGeo("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeo("ok");
      },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
    );
  };

  const reset = () => {
    setShowKinds({ destinasi: true, akomodasi: true, kuliner: true });
    setGroup("semua");
    setDistrict("semua");
    setQ("");
    setRadius(0);
    setUserPos(null);
    setGeo("idle");
    setSelected(null);
  };

  const pick = (id: string, p: MapPoint) => {
    setSelected(id);
    mapRef.current?.flyTo([p.lat, p.lng], Math.max(mapRef.current.getZoom(), 14), { duration: 0.8 });
    markersRef.current.get(id)?.openPopup();
    containerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const sel = "w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-primary-500";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
      <aside className="space-y-4 order-2 lg:order-1">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama, kecamatan, kategori..."
              aria-label="Cari di peta"
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-primary-500"
            />
          </div>

          <fieldset className="flex gap-4 text-xs">
            <legend className="sr-only">Tampilkan jenis lokasi</legend>
            {(["destinasi", "akomodasi", "kuliner"] as const).map((k) => (
              <label key={k} className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showKinds[k]} onChange={(e) => setShowKinds({ ...showKinds, [k]: e.target.checked })} />
                <span className={`w-2.5 h-2.5 rounded-full ${k === "destinasi" ? "bg-primary-800" : k === "akomodasi" ? "bg-secondary-500" : "bg-orange-700"}`} />
                {KIND_LABEL[k]}
              </label>
            ))}
          </fieldset>

          <div className="grid grid-cols-2 gap-2">
            <select value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Kategori" className={sel}>
              <option value="semua">Semua kategori</option>
              {groups.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="Kecamatan" className={sel}>
              <option value="semua">Semua kecamatan</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-1 border-t border-stone-100">
            <button
              type="button"
              onClick={locate}
              disabled={geo === "loading"}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary-800 text-white text-xs font-semibold hover:bg-primary-900 disabled:opacity-60 cursor-pointer"
            >
              {geo === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
              {userPos ? "Perbarui lokasi saya" : "Dekat saya"}
            </button>
            {userPos && (
              <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} aria-label="Radius" className={sel}>
                <option value={0}>Semua jarak</option>
                {[5, 10, 25, 50].map((r) => (
                  <option key={r} value={r}>
                    Dalam {r} km
                  </option>
                ))}
              </select>
            )}
            {geo === "denied" && (
              <p role="alert" className="flex items-start gap-1.5 text-[11px] text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Izin lokasi ditolak. Aktifkan izin lokasi di browser untuk memakai fitur ini.
              </p>
            )}
            {geo === "unavailable" && (
              <p role="alert" className="flex items-start gap-1.5 text-[11px] text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Lokasi tidak tersedia (butuh koneksi aman HTTPS dan GPS/jaringan aktif).
              </p>
            )}
            <p className="text-[10px] text-stone-400">Lokasimu hanya diproses di browser ini dan tidak dikirim ke server.</p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500">
            <span aria-live="polite">
              {visible.length} dari {points.length} lokasi
            </span>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-semibold text-primary-800 hover:underline cursor-pointer">
              <RotateCcw className="w-3 h-3" /> Atur ulang
            </button>
          </div>
        </div>

        <ul className="bg-white rounded-2xl border border-stone-200 shadow-sm divide-y divide-stone-100 max-h-[46vh] lg:max-h-[calc(100vh-30rem)] overflow-y-auto" aria-label="Daftar lokasi">
          {visible.length === 0 && <li className="p-6 text-center text-xs text-stone-400">Tidak ada lokasi yang cocok.</li>}
          {visible.map(({ p, km }) => (
            <li key={p.id} className={`flex items-center gap-3 p-3 ${selected === p.id ? "bg-primary-50" : ""}`}>
              <button type="button" onClick={() => pick(p.id, p)} className="flex flex-1 items-center gap-3 text-left min-w-0 cursor-pointer">
                <span className="relative w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-primary-900 to-primary-950 shrink-0">
                  {p.image ? (
                    <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <MapPin className="absolute inset-0 m-auto w-5 h-5 text-secondary-400/70" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-stone-900 truncate">{p.name}</span>
                  <span className="block text-[11px] text-stone-500 truncate">
                    {p.groupLabel} • Kec. {p.district}
                  </span>
                  <span className="flex items-center gap-2 text-[11px]">
                    <span className={`px-1.5 rounded text-[10px] font-bold ${p.kind === "destinasi" ? "bg-primary-100 text-primary-800" : p.kind === "akomodasi" ? "bg-secondary-100 text-secondary-800" : "bg-orange-100 text-orange-800"}`}>
                      {KIND_LABEL[p.kind]}
                    </span>
                    {km !== null && <span className="font-semibold text-blue-700">{formatKm(km)}</span>}
                  </span>
                </span>
              </button>
              {p.kind === "destinasi" && <WishlistButton slug={p.slug} name={p.name} className="!bg-stone-100 !text-stone-500 !border-stone-200 hover:!bg-stone-200" />}
            </li>
          ))}
        </ul>
      </aside>

      <div className="order-1 lg:order-2 relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-100 min-h-[420px] h-[58vh] lg:h-[calc(100vh-13rem)]">
        <div ref={containerRef} role="application" aria-label="Peta interaktif destinasi dan akomodasi Purbalingga" className="absolute inset-0 z-0" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Memuat peta...
          </div>
        )}
        <noscript>
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-stone-600">
            Peta membutuhkan JavaScript. Daftar lokasi tersedia di halaman Destinasi dan Akomodasi.
          </p>
        </noscript>
      </div>
    </div>
  );
}
