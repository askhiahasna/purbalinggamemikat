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
import { slugify } from "@/lib/utils";
import type { ActionResult } from "./cms-actions";
import { authorize } from "@/server/auth/dal";
import { removeByUrls, verifyImageUrl } from "@/server/storage/storage";
import { CONTENT_ROLES } from "@/lib/auth/permissions";
import { businessSchema, categoryId, culinarySchema, eventSchema, imageUrl } from "@/lib/validation/content";

// Semua action admin memanggil authorize(CONTENT_ROLES) di server. Hanya submitReviewAction yang publik.

type CategoryType = "CULINARY" | "EVENT" | "UMKM" | "ARTICLE";


function fail(err: unknown, fallback: string): ActionResult {
  console.error(err);
  return { success: false, error: fallback };
}

function firstIssue(e: z.ZodError) {
  return e.issues[0]?.message ?? "Data tidak valid.";
}

async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>) {
  const root = base || "item";
  let slug = root;
  for (let i = 2; await exists(slug); i++) slug = `${root}-${i}`;
  return slug;
}

/** Kategori harus ada dan bertipe sesuai (cegah kategori silang). */
async function checkCategory(id: string | undefined, type: CategoryType) {
  if (!id) return true;
  const c = await prisma.category.findUnique({ where: { id }, select: { type: true } });
  return c?.type === type;
}


async function checkImage(url: string | null) {
  return url === null || (await verifyImageUrl(url));
}
const IMAGE_ERROR = "Foto tidak valid atau belum terunggah.";

const defaultAddress = (district: string) => `Kec. ${district}, Kabupaten Purbalingga`;

/* ------------------------------ Kuliner ----------------------------- */


function revalidateCulinary() {
  revalidatePath("/");
  revalidatePath("/kuliner");
  revalidatePath("/admin/kuliner");
}

export async function createCulinaryAction(input: unknown): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = culinarySchema.safeParse(input);
  if (!p.success) return { success: false, error: firstIssue(p.error) };
  const d = p.data;
  try {
    if (!(await checkCategory(d.categoryId, "CULINARY"))) return { success: false, error: "Kategori tidak valid." };
    if (!(await checkImage(d.imageUrl))) return { success: false, error: IMAGE_ERROR };
    const slug = await uniqueSlug(
      slugify(d.name),
      async (s) => !!(await prisma.culinary.findUnique({ where: { slug: s }, select: { id: true } }))
    );
    await prisma.culinary.create({
      data: { ...d, slug, address: d.address ?? defaultAddress(d.district), categoryId: d.categoryId ?? null },
    });
    revalidateCulinary();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal menyimpan kuliner.");
  }
}

export async function updateCulinaryAction(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = culinarySchema.safeParse(input);
  if (!p.success) return { success: false, error: firstIssue(p.error) };
  const d = p.data;
  try {
    if (!(await checkCategory(d.categoryId, "CULINARY"))) return { success: false, error: "Kategori tidak valid." };
    if (!(await checkImage(d.imageUrl))) return { success: false, error: IMAGE_ERROR };
    const old = await prisma.culinary.findUnique({ where: { id }, select: { imageUrl: true } });
    await prisma.culinary.update({
      where: { id },
      data: {
        ...d,
        address: d.address ?? defaultAddress(d.district),
        priceRange: d.priceRange ?? null,
        categoryId: d.categoryId ?? null,
      },
    });
    if (old?.imageUrl && old.imageUrl !== d.imageUrl) await removeByUrls([old.imageUrl]);
    revalidateCulinary();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal memperbarui kuliner.");
  }
}

export async function deleteCulinaryAction(id: string): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const old = await prisma.culinary.findUnique({ where: { id }, select: { imageUrl: true } });
    await prisma.culinary.delete({ where: { id } });
    await removeByUrls([old?.imageUrl]);
    revalidateCulinary();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal menghapus kuliner.");
  }
}

/* ------------------------------- Event ------------------------------ */


function revalidateEvents() {
  revalidatePath("/");
  revalidatePath("/budaya-event");
  revalidatePath("/admin/event");
}

export async function createEventAction(input: unknown): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = eventSchema.safeParse(input);
  if (!p.success) return { success: false, error: firstIssue(p.error) };
  const d = p.data;
  try {
    if (!(await checkCategory(d.categoryId, "EVENT"))) return { success: false, error: "Kategori tidak valid." };
    if (!(await checkImage(d.bannerUrl))) return { success: false, error: IMAGE_ERROR };
    const slug = await uniqueSlug(
      slugify(d.title),
      async (s) => !!(await prisma.event.findUnique({ where: { slug: s }, select: { id: true } }))
    );
    await prisma.event.create({
      data: { ...d, slug, startDate: d.startDate!, endDate: d.endDate ?? null, categoryId: d.categoryId ?? null },
    });
    revalidateEvents();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal menyimpan event.");
  }
}

export async function updateEventAction(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = eventSchema.safeParse(input);
  if (!p.success) return { success: false, error: firstIssue(p.error) };
  const d = p.data;
  try {
    if (!(await checkCategory(d.categoryId, "EVENT"))) return { success: false, error: "Kategori tidak valid." };
    if (!(await checkImage(d.bannerUrl))) return { success: false, error: IMAGE_ERROR };
    const old = await prisma.event.findUnique({ where: { id }, select: { bannerUrl: true } });
    await prisma.event.update({
      where: { id },
      data: {
        ...d,
        startDate: d.startDate!,
        endDate: d.endDate ?? null,
        organizer: d.organizer ?? null,
        categoryId: d.categoryId ?? null,
      },
    });
    if (old?.bannerUrl && old.bannerUrl !== d.bannerUrl) await removeByUrls([old.bannerUrl]);
    revalidateEvents();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal memperbarui event.");
  }
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const old = await prisma.event.findUnique({ where: { id }, select: { bannerUrl: true } });
    await prisma.event.delete({ where: { id } });
    await removeByUrls([old?.bannerUrl]);
    revalidateEvents();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal menghapus event.");
  }
}

/* -------------------------------- UMKM ------------------------------ */


function revalidateBusinesses() {
  revalidatePath("/umkm");
  revalidatePath("/admin/umkm");
}

export async function createBusinessAction(input: unknown): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = businessSchema.safeParse(input);
  if (!p.success) return { success: false, error: firstIssue(p.error) };
  const d = p.data;
  try {
    if (!(await checkCategory(d.categoryId, "UMKM"))) return { success: false, error: "Kategori tidak valid." };
    if (!(await checkImage(d.logoUrl))) return { success: false, error: IMAGE_ERROR };
    const slug = await uniqueSlug(
      slugify(d.name),
      async (s) => !!(await prisma.business.findUnique({ where: { slug: s }, select: { id: true } }))
    );
    await prisma.business.create({
      data: { ...d, slug, address: d.address ?? defaultAddress(d.district), categoryId: d.categoryId ?? null },
    });
    revalidateBusinesses();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal menyimpan UMKM.");
  }
}

export async function updateBusinessAction(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = businessSchema.safeParse(input);
  if (!p.success) return { success: false, error: firstIssue(p.error) };
  const d = p.data;
  try {
    if (!(await checkCategory(d.categoryId, "UMKM"))) return { success: false, error: "Kategori tidak valid." };
    if (!(await checkImage(d.logoUrl))) return { success: false, error: IMAGE_ERROR };
    const old = await prisma.business.findUnique({ where: { id }, select: { logoUrl: true } });
    await prisma.business.update({
      where: { id },
      data: {
        ...d,
        address: d.address ?? defaultAddress(d.district),
        ownerName: d.ownerName ?? null,
        whatsappNumber: d.whatsappNumber ?? null,
        categoryId: d.categoryId ?? null,
      },
    });
    if (old?.logoUrl && old.logoUrl !== d.logoUrl) await removeByUrls([old.logoUrl]);
    revalidateBusinesses();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal memperbarui UMKM.");
  }
}

export async function deleteBusinessAction(id: string): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const old = await prisma.business.findUnique({ where: { id }, select: { logoUrl: true } });
    await prisma.business.delete({ where: { id } });
    await removeByUrls([old?.logoUrl]);
    revalidateBusinesses();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal menghapus UMKM.");
  }
}

/* ------------------------------- Berita ----------------------------- */

const articleSchema = z.object({
  title: z.string().trim().min(5, "Judul minimal 5 karakter").max(250),
  excerpt: z.string().trim().min(1, "Ringkasan wajib diisi").max(500),
  content: z.string().trim().min(1, "Isi berita wajib diisi").max(50000),
  coverImageUrl: imageUrl,
  categoryId,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

function revalidateArticles() {
  revalidatePath("/");
  revalidatePath("/berita");
  revalidatePath("/admin/berita");
}

export async function createArticleAction(input: unknown): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = articleSchema.safeParse(input);
  if (!p.success) return { success: false, error: firstIssue(p.error) };
  const d = p.data;
  try {
    if (!(await checkCategory(d.categoryId, "ARTICLE"))) return { success: false, error: "Kategori tidak valid." };
    if (!(await checkImage(d.coverImageUrl))) return { success: false, error: IMAGE_ERROR };
    const authorId = auth.user.id; // penulis = user yang sedang login
    const slug = await uniqueSlug(
      slugify(d.title),
      async (s) => !!(await prisma.article.findUnique({ where: { slug: s }, select: { id: true } }))
    );
    await prisma.article.create({
      data: {
        ...d,
        slug,
        authorId,
        categoryId: d.categoryId ?? null,
        publishedAt: d.status === "PUBLISHED" ? new Date() : null,
      },
    });
    revalidateArticles();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal menyimpan berita.");
  }
}

export async function updateArticleAction(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = articleSchema.safeParse(input);
  if (!p.success) return { success: false, error: firstIssue(p.error) };
  const d = p.data;
  try {
    if (!(await checkCategory(d.categoryId, "ARTICLE"))) return { success: false, error: "Kategori tidak valid." };
    if (!(await checkImage(d.coverImageUrl))) return { success: false, error: IMAGE_ERROR };
    const old = await prisma.article.findUnique({ where: { id }, select: { coverImageUrl: true } });
    const current = await prisma.article.findUnique({ where: { id }, select: { publishedAt: true } });
    if (!current) return { success: false, error: "Berita tidak ditemukan." };
    await prisma.article.update({
      where: { id },
      data: {
        ...d,
        categoryId: d.categoryId ?? null,
        publishedAt: d.status === "PUBLISHED" ? (current.publishedAt ?? new Date()) : current.publishedAt,
      },
    });
    if (old?.coverImageUrl && old.coverImageUrl !== d.coverImageUrl) await removeByUrls([old.coverImageUrl]);
    revalidateArticles();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal memperbarui berita.");
  }
}

export async function deleteArticleAction(id: string): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const old = await prisma.article.findUnique({ where: { id }, select: { coverImageUrl: true } });
    await prisma.article.delete({ where: { id } });
    await removeByUrls([old?.coverImageUrl]);
    revalidateArticles();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal menghapus berita.");
  }
}

/* ------------------------------ Ulasan ------------------------------ */

const reviewSchema = z.object({
  destinationId: z.string().trim().min(1),
  authorName: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Ulasan minimal 5 karakter").max(1500),
});

/** Aksi publik: ulasan masuk antrean moderasi (belum tampil). */
export async function submitReviewAction(input: unknown): Promise<ActionResult> {
  const p = reviewSchema.safeParse(input);
  if (!p.success) return { success: false, error: firstIssue(p.error) };
  try {
    const dest = await prisma.destination.findFirst({
      where: { id: p.data.destinationId, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!dest) return { success: false, error: "Destinasi tidak ditemukan." };
    await prisma.review.create({
      data: { ...p.data, authorEmail: "anonim@example.invalid", isApproved: false },
    });
    revalidatePath("/admin/moderasi");
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal mengirim ulasan.");
  }
}

function revalidateReviews() {
  revalidatePath("/admin/moderasi");
  revalidatePath("/destinasi", "layout");
  revalidatePath("/");
}

export async function approveReviewAction(id: string): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    await prisma.review.update({ where: { id }, data: { isApproved: true, approvedAt: new Date() } });
    revalidateReviews();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal menyetujui ulasan.");
  }
}

export async function deleteReviewAction(id: string): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    await prisma.review.delete({ where: { id } });
    revalidateReviews();
    return { success: true };
  } catch (e) {
    return fail(e, "Gagal menghapus ulasan.");
  }
}
