"use server";

import { revalidatePath as revalidateRoute, updateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/cache";

/** Invalidate halaman + cache data publik sekaligus agar perubahan CMS langsung terlihat. */
const revalidatePath = (path: string, type?: "page" | "layout") => {
  revalidateRoute(path, type);
  updateTag(CONTENT_TAG);
};
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize, canManageDestination } from "@/server/auth/dal";
import { ADMIN_ONLY, CONTENT_ROLES, DESTINATION_ROLES } from "@/lib/auth/permissions";
import {
  ALLOWED_MIME,
  MAX_IMAGE_BYTES,
  createSignedUpload,
  publicUrlFor,
  removeByUrls,
  verifyImageUrl,
} from "@/server/storage/storage";
import { MAX_GALLERY_IMAGES } from "@/lib/media";
import type { ActionResult } from "./cms-actions";

const SCOPES = ["destinasi", "berita", "kuliner", "umkm", "event", "pengaturan", "akomodasi"] as const;

const uploadSchema = z.object({
  scope: z.enum(SCOPES),
  entityId: z.string().trim().max(60).regex(/^[A-Za-z0-9_-]*$/).nullish(),
  mime: z.string().refine((m) => m in ALLOWED_MIME, "Tipe file harus JPG, PNG, atau WebP"),
  size: z.number().int().min(1).max(MAX_IMAGE_BYTES, "Ukuran foto maksimal 5 MB"),
});

export type UploadTicket = { signedUrl: string; publicUrl: string };

/** Langkah 1: server mengesahkan upload & memberi URL bertanda tangan sekali pakai. */
export async function createUploadUrlAction(input: unknown): Promise<ActionResult<UploadTicket>> {
  const p = uploadSchema.safeParse(input);
  if (!p.success) return { success: false, error: p.error.issues[0]?.message ?? "Data tidak valid." };
  const { scope, entityId, mime } = p.data;

  const auth = await authorize(
    scope === "destinasi" ? DESTINATION_ROLES : scope === "pengaturan" ? ADMIN_ONLY : CONTENT_ROLES
  );
  if (!auth.ok) return { success: false, error: auth.error };
  // Pengelola destinasi hanya boleh mengunggah untuk destinasi yang ditugaskan padanya.
  if (scope === "destinasi" && auth.user.role === "DESTINATION_MANAGER") {
    if (!entityId || !(await canManageDestination(auth.user, entityId))) {
      return { success: false, error: "Anda tidak berwenang mengunggah untuk destinasi ini." };
    }
  }

  try {
    const path = `${scope}/${entityId || "baru"}/${crypto.randomUUID().replace(/-/g, "")}.${ALLOWED_MIME[mime]}`;
    const t = await createSignedUpload(path);
    return { success: true, data: { signedUrl: t.signedUrl, publicUrl: publicUrlFor(path) } };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Layanan penyimpanan tidak tersedia. Periksa konfigurasi Supabase." };
  }
}

/* ------------------------- Galeri destinasi ------------------------- */

async function guardDestination(destinationId: string) {
  const auth = await authorize(DESTINATION_ROLES);
  if (!auth.ok) return { ok: false as const, error: auth.error };
  if (!(await canManageDestination(auth.user, destinationId))) {
    return { ok: false as const, error: "Anda tidak berwenang mengelola destinasi ini." };
  }
  return { ok: true as const, user: auth.user };
}

async function revalidateGallery(destinationId: string) {
  const d = await prisma.destination.findUnique({ where: { id: destinationId }, select: { slug: true } });
  revalidatePath("/");
  revalidatePath("/destinasi");
  if (d) revalidatePath(`/destinasi/${d.slug}`);
  revalidatePath("/admin/destinasi");
}

async function imageWithGuard(imageId: string) {
  const img = await prisma.destinationImage.findUnique({ where: { id: imageId } });
  if (!img) return { ok: false as const, error: "Foto tidak ditemukan." };
  const g = await guardDestination(img.destinationId);
  if (!g.ok) return { ok: false as const, error: g.error };
  return { ok: true as const, img };
}

export async function addDestinationImageAction(destinationId: string, url: string): Promise<ActionResult> {
  const g = await guardDestination(destinationId);
  if (!g.ok) return { success: false, error: g.error };
  if (!(await verifyImageUrl(url))) return { success: false, error: "Foto tidak valid atau belum terunggah." };
  try {
    const existing = await prisma.destinationImage.findMany({
      where: { destinationId },
      select: { sortOrder: true, url: true },
    });
    if (existing.length >= MAX_GALLERY_IMAGES) {
      await removeByUrls([url]);
      return { success: false, error: `Maksimal ${MAX_GALLERY_IMAGES} foto per destinasi.` };
    }
    if (existing.some((e) => e.url === url)) return { success: false, error: "Foto sudah ada di galeri." };
    await prisma.destinationImage.create({
      data: {
        destinationId,
        url,
        isCover: existing.length === 0,
        sortOrder: existing.reduce((m, e) => Math.max(m, e.sortOrder), -1) + 1,
      },
    });
    await revalidateGallery(destinationId);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menyimpan foto." };
  }
}

export async function setCoverImageAction(imageId: string): Promise<ActionResult> {
  const r = await imageWithGuard(imageId);
  if (!r.ok) return { success: false, error: r.error };
  try {
    await prisma.$transaction([
      prisma.destinationImage.updateMany({ where: { destinationId: r.img.destinationId }, data: { isCover: false } }),
      prisma.destinationImage.update({ where: { id: imageId }, data: { isCover: true } }),
    ]);
    await revalidateGallery(r.img.destinationId);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal mengatur foto sampul." };
  }
}

export async function moveImageAction(imageId: string, direction: "up" | "down"): Promise<ActionResult> {
  const r = await imageWithGuard(imageId);
  if (!r.ok) return { success: false, error: r.error };
  try {
    const all = await prisma.destinationImage.findMany({
      where: { destinationId: r.img.destinationId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true },
    });
    const i = all.findIndex((x) => x.id === imageId);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= all.length) return { success: true };
    [all[i], all[j]] = [all[j], all[i]];
    await prisma.$transaction(
      all.map((x, idx) => prisma.destinationImage.update({ where: { id: x.id }, data: { sortOrder: idx } }))
    );
    await revalidateGallery(r.img.destinationId);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal mengubah urutan foto." };
  }
}

export async function updateImageCaptionAction(imageId: string, caption: string): Promise<ActionResult> {
  const c = z.string().trim().max(200).safeParse(caption);
  if (!c.success) return { success: false, error: "Keterangan maksimal 200 karakter." };
  const r = await imageWithGuard(imageId);
  if (!r.ok) return { success: false, error: r.error };
  try {
    await prisma.destinationImage.update({ where: { id: imageId }, data: { caption: c.data || null } });
    await revalidateGallery(r.img.destinationId);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menyimpan keterangan." };
  }
}

export async function deleteDestinationImageAction(imageId: string): Promise<ActionResult> {
  const r = await imageWithGuard(imageId);
  if (!r.ok) return { success: false, error: r.error };
  try {
    await prisma.destinationImage.delete({ where: { id: imageId } });
    if (r.img.isCover) {
      const next = await prisma.destinationImage.findFirst({
        where: { destinationId: r.img.destinationId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      });
      if (next) await prisma.destinationImage.update({ where: { id: next.id }, data: { isCover: true } });
    }
    await removeByUrls([r.img.url]);
    await revalidateGallery(r.img.destinationId);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menghapus foto." };
  }
}
