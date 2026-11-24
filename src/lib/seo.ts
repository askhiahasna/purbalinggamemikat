import type { Metadata } from "next";

export const SITE_NAME = "Purbalingga Memikat";
export const SITE_TAGLINE = "Pesona Wisata & Potensi Daerah";
export const DEFAULT_DESCRIPTION =
  "Portal informasi pariwisata, kebudayaan, kuliner khas, UMKM, dan potensi daerah Kabupaten Purbalingga, Jawa Tengah.";

/** Domain publik situs. WAJIB diisi NEXT_PUBLIC_APP_URL dengan domain sebenarnya saat produksi. */
export function siteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").trim();
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/"): string {
  return siteUrl() + (path.startsWith("/") ? path : `/${path}`);
}

/** Rapikan & potong deskripsi untuk meta/OG (±160 karakter, tanpa memotong kata). */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length).trimEnd() + "…";
}

/** Serialisasi JSON-LD yang aman dari injeksi "</script>" (data berasal dari CMS/pengunjung). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, String.fromCharCode(92) + "u003c") // "<" -> < agar "</script>" tidak bisa menutup tag
    .split(String.fromCharCode(0x2028)).join("")
    .split(String.fromCharCode(0x2029)).join("");
}

/** ISO 8601 dengan offset WIB (+07:00) untuk schema.org (mis. startDate event). */
export function toWibIso(d: Date): string {
  return new Date(d.getTime() + 7 * 3600_000).toISOString().replace(/\.\d{3}Z$/, "+07:00");
}

interface PageMeta {
  title?: string;
  description: string;
  path: string;
  /** URL absolut atau path gambar OG. Default: gambar merek dinamis /opengraph-image. */
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

/** Metadata lengkap (canonical, OpenGraph, Twitter). openGraph anak MENGGANTI openGraph induk, jadi diisi utuh. */
export function pageMetadata(m: PageMeta): Metadata {
  const description = truncate(m.description);
  const image = m.image || "/opengraph-image";
  const fullTitle = m.title ? `${m.title} | ${SITE_NAME}` : `${SITE_NAME} - ${SITE_TAGLINE}`;
  return {
    ...(m.title ? { title: m.title } : {}),
    description,
    alternates: { canonical: m.path },
    robots: m.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: m.type ?? "website",
      siteName: SITE_NAME,
      locale: "id_ID",
      url: m.path,
      title: fullTitle,
      description,
      images: [{ url: image, alt: m.title ?? SITE_NAME }],
      ...(m.type === "article" ? { publishedTime: m.publishedTime, modifiedTime: m.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
