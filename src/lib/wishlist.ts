// Penyimpanan wishlist (destinasi tersimpan) di localStorage perangkat — tanpa akun, tanpa server.
// Fungsi murni (parse/serialize) dipisah agar mudah diuji.

export const WISHLIST_KEY = "pm_wishlist_v1";
export const WISHLIST_EVENT = "pm:wishlist";
export const WISHLIST_MAX = 100;
const SLUG = /^[a-z0-9][a-z0-9-]{0,119}$/;

/** Parse aman: data rusak/disusupi (bukan array, bukan slug valid) dibuang. */
export function parseWishlist(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    const out: string[] = [];
    for (const x of v) {
      if (typeof x === "string" && SLUG.test(x) && !out.includes(x)) out.push(x);
      if (out.length >= WISHLIST_MAX) break;
    }
    return out;
  } catch {
    return [];
  }
}

export function toggleSlug(list: string[], slug: string): string[] {
  if (!SLUG.test(slug)) return list;
  if (list.includes(slug)) return list.filter((s) => s !== slug);
  return [slug, ...list].slice(0, WISHLIST_MAX);
}

export function readRaw(): string {
  try {
    return window.localStorage.getItem(WISHLIST_KEY) ?? "[]";
  } catch {
    return "[]"; // mode privat / penyimpanan diblokir
  }
}

export function writeList(list: string[]) {
  try {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  } catch {
    /* penyimpanan penuh/diblokir: abaikan */
  }
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}
