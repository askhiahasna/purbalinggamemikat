import { getSupabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase/admin";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function publicPrefix() {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/`;
}

export function publicUrlFor(path: string) {
  return publicPrefix() + path;
}

/** Path objek bila URL berasal dari bucket kita (anti URL luar / path traversal), selain itu null. */
export function pathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const prefix = publicPrefix();
  if (!url.startsWith(prefix)) return null;
  const path = url.slice(prefix.length);
  if (!/^[a-z0-9_-]+\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.(webp|jpg|png)$/.test(path)) return null;
  return path;
}

export async function createSignedUpload(path: string) {
  const { data, error } = await getSupabaseAdmin().storage.from(STORAGE_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? "Gagal membuat URL upload.");
  return data; // { signedUrl, token, path }
}

export async function objectExists(path: string) {
  const i = path.lastIndexOf("/");
  const { data, error } = await getSupabaseAdmin()
    .storage.from(STORAGE_BUCKET)
    .list(path.slice(0, i), { search: path.slice(i + 1), limit: 1 });
  return !error && !!data?.some((o) => o.name === path.slice(i + 1));
}

/** Menghapus objek berdasarkan URL publik; URL asing diabaikan. Tidak melempar error. */
export async function removeByUrls(urls: (string | null | undefined)[]) {
  const paths = urls.map(pathFromPublicUrl).filter((p): p is string => !!p);
  if (!paths.length) return;
  const { error } = await getSupabaseAdmin().storage.from(STORAGE_BUCKET).remove(paths);
  if (error) console.error("Gagal menghapus objek storage:", error.message);
}

/** Validasi URL gambar yang dikirim klien: harus dari bucket kita dan objeknya benar-benar ada. */
export async function verifyImageUrl(url: string): Promise<boolean> {
  const path = pathFromPublicUrl(url);
  return !!path && (await objectExists(path));
}
