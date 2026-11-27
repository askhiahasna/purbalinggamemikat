import { revalidateTag, unstable_cache, updateTag } from "next/cache";

/** Tag tunggal untuk seluruh konten publik; di-invalidate oleh aksi admin (lihat `invalidate` di server/actions). */
export const CONTENT_TAG = "content";

/** Batas atas kesegaran bila ada perubahan data di luar aksi admin (mis. impor langsung ke DB). */
const MAX_AGE_SECONDS = 300;

/**
 * Cache hasil query publik di Data Cache Next.js. Argumen ikut membentuk kunci cache.
 * Hasil harus JSON-serializable (tanpa Date/BigInt) — query publik sudah memformat tanggal menjadi string.
 */
export function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string): (...args: A) => Promise<R> {
  return unstable_cache(fn, [key], { tags: [CONTENT_TAG], revalidate: MAX_AGE_SECONDS });
}

/**
 * Invalidate cache konten publik. Di Server Action memakai `updateTag` (pengguna langsung melihat hasil tulisnya);
 * di Route Handler (mis. impor CSV/Excel) `updateTag` tidak tersedia, jadi memakai `revalidateTag` dengan kedaluwarsa langsung.
 */
export function invalidateContent() {
  try {
    updateTag(CONTENT_TAG);
  } catch {
    revalidateTag(CONTENT_TAG, { expire: 0 });
  }
}
