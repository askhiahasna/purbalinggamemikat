import { MAX_UPLOAD_BYTES } from "@/lib/media";

/** Perkecil di browser (maks. sisi 1600px) dan ubah ke WebP agar hemat kuota Storage. Hanya client. */
export async function prepareImage(file: File, maxSide = 1600, quality = 0.82): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Tipe file harus JPG, PNG, atau WebP.");
  }
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/webp", quality));
    if (blob && blob.type === "image/webp") return blob;
  } catch {
    // jatuh ke file asli bila browser tidak bisa memproses
  }
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Ukuran foto maksimal 5 MB.");
  return file;
}

/** Langkah 2: kirim file langsung ke Supabase memakai URL bertanda tangan dari server. */
export async function putToSignedUrl(signedUrl: string, blob: Blob): Promise<void> {
  const fd = new FormData();
  fd.append("cacheControl", "31536000");
  fd.append("", blob);
  const res = await fetch(signedUrl, { method: "PUT", body: fd, headers: { "x-upsert": "false" } });
  if (!res.ok) throw new Error("Unggahan ditolak oleh penyimpanan (tipe/ukuran tidak sesuai).");
}
