"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "@/lib/data/cms-store";
import { getSiteSettings, saveSiteSettings } from "@/server/queries/settings";
import { authorize, canManageDestination } from "@/server/auth/dal";
import { removeByUrls, verifyImageUrl } from "@/server/storage/storage";
import { ADMIN_ONLY, CONTENT_ROLES, DESTINATION_ROLES } from "@/lib/auth/permissions";

// Setiap action memanggil authorize()/canManageDestination() di server (bukan hanya menyembunyikan UI).

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(200),
  logoUrl: z.string().trim().max(500),
  heroBadge: z.string().trim().max(80),
  heroTitlePrefix: z.string().trim().max(80),
  heroTitleMain: z.string().trim().max(80),
  heroSubtitle: z.string().trim().max(500),
  marqueeItems: z.array(z.string().trim().min(1).max(120)).max(30),
  sekilasTitle: z.string().trim().max(120),
  sekilasQuote: z.string().trim().max(500),
  leader1Name: z.string().trim().max(120),
  leader1Title: z.string().trim().max(120),
  leader2Name: z.string().trim().max(120),
  leader2Title: z.string().trim().max(120),
  contactPhone: z.string().trim().max(40),
  contactEmail: z.string().trim().max(160),
  contactAddress: z.string().trim().max(300),
  heroBgUrl: z.string().trim().max(500),
  leader1PhotoUrl: z.string().trim().max(500),
  leader2PhotoUrl: z.string().trim().max(500),
  statImage1Url: z.string().trim().max(500),
  statImage2Url: z.string().trim().max(500),
  statImage3Url: z.string().trim().max(500),
  statImage4Url: z.string().trim().max(500),
});

const IMAGE_KEYS = [
  "heroBgUrl",
  "leader1PhotoUrl",
  "leader2PhotoUrl",
  "statImage1Url",
  "statImage2Url",
  "statImage3Url",
  "statImage4Url",
] as const;

export async function updateSiteSettingsAction(input: Partial<SiteSettings>) {
  const auth = await authorize(ADMIN_ONLY);
  if (!auth.ok) return { success: false as const, error: auth.error };
  const parsed = settingsSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Data pengaturan tidak valid." };
  }
  try {
    // Foto: hanya URL dari bucket kita dengan objek yang benar-benar ada; foto lama dihapus bila diganti.
    const current = await getSiteSettings();
    const changed: string[] = [];
    for (const k of IMAGE_KEYS) {
      const next = parsed.data[k];
      if (next === undefined || next === current[k]) continue;
      if (next && !(await verifyImageUrl(next))) {
        return { success: false as const, error: "Foto tidak valid atau belum terunggah." };
      }
      if (current[k]) changed.push(current[k]);
    }
    const updated = await saveSiteSettings(parsed.data);
    await removeByUrls(changed);
    revalidatePath("/", "layout");
    revalidatePath("/admin/pengaturan");
    return { success: true as const, settings: updated };
  } catch (err) {
    console.error(err);
    return { success: false as const, error: "Gagal menyimpan pengaturan ke database." };
  }
}

// ---------------------------------------------------------------------------
// Destinasi
// ---------------------------------------------------------------------------

const destinationSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(150),
  categorySlug: z.string().trim().min(1, "Kategori wajib dipilih"),
  district: z.string().trim().min(1, "Kecamatan wajib diisi").max(80),
  address: z.string().trim().max(300).optional(),
  summary: z.string().trim().max(300).optional(),
  description: z.string().trim().max(10000).optional(),
  ticketPriceWeekday: z.coerce.number().int().min(0).max(100_000_000),
  ticketPriceWeekend: z.coerce.number().int().min(0).max(100_000_000),
  openingHours: z.string().trim().max(80).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  managerId: z.string().trim().nullish().transform((v) => v || null),
});

export type DestinationInput = z.input<typeof destinationSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || "destinasi";
  let slug = root;
  for (let i = 2; await prisma.destination.findUnique({ where: { slug }, select: { id: true } }); i++) {
    slug = `${root}-${i}`;
  }
  return slug;
}

function revalidateDestinations(slug?: string) {
  revalidatePath("/");
  revalidatePath("/destinasi");
  if (slug) revalidatePath(`/destinasi/${slug}`);
  revalidatePath("/admin/destinasi");
}

/** Hanya SUPER_ADMIN yang boleh menugaskan pengelola; id harus user DESTINATION_MANAGER aktif. */
async function validManagerId(id: string | null) {
  if (!id) return null;
  const u = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } });
  return u && u.isActive && u.role === "DESTINATION_MANAGER" ? id : undefined;
}

export async function createDestinationAction(input: DestinationInput): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const parsed = destinationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const d = parsed.data;
  try {
    const category = await prisma.category.findUnique({
      where: { slug: d.categorySlug },
      select: { id: true, type: true },
    });
    if (!category || category.type !== "DESTINATION") {
      return { success: false, error: "Kategori tidak ditemukan." };
    }
    let managerId: string | null = null;
    if (auth.user.role === "SUPER_ADMIN") {
      const m = await validManagerId(d.managerId);
      if (m === undefined) return { success: false, error: "Pengelola tidak valid." };
      managerId = m;
    }
    const slug = await uniqueSlug(slugify(d.name));
    await prisma.destination.create({
      data: {
        slug,
        managerId,
        name: d.name,
        categoryId: category.id,
        district: d.district,
        address: d.address || `Kec. ${d.district}, Kabupaten Purbalingga`,
        summary: d.summary || "Ringkasan belum diisi.",
        description: d.description || "Deskripsi belum diisi.",
        ticketPriceWeekday: d.ticketPriceWeekday,
        ticketPriceWeekend: d.ticketPriceWeekend,
        openingHours: d.openingHours || null,
        status: d.status,
      },
    });
    revalidateDestinations(slug);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Gagal menyimpan destinasi." };
  }
}

export async function updateDestinationAction(id: string, input: DestinationInput): Promise<ActionResult> {
  const auth = await authorize(DESTINATION_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!(await canManageDestination(auth.user, id))) {
    return { success: false, error: "Anda tidak berwenang mengelola destinasi ini." };
  }
  const isManager = auth.user.role === "DESTINATION_MANAGER";
  const parsed = destinationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const d = parsed.data;
  try {
    const category = await prisma.category.findUnique({
      where: { slug: d.categorySlug },
      select: { id: true, type: true },
    });
    if (!category || category.type !== "DESTINATION") {
      return { success: false, error: "Kategori tidak ditemukan." };
    }
    let managerPatch: { managerId: string | null } | Record<string, never> = {};
    if (auth.user.role === "SUPER_ADMIN") {
      const m = await validManagerId(d.managerId);
      if (m === undefined) return { success: false, error: "Pengelola tidak valid." };
      managerPatch = { managerId: m };
    }
    const updated = await prisma.destination.update({
      where: { id },
      data: {
        ...managerPatch,
        name: d.name,
        categoryId: category.id,
        district: d.district,
        ...(d.address ? { address: d.address } : {}),
        ...(d.summary ? { summary: d.summary } : {}),
        ...(d.description ? { description: d.description } : {}),
        ticketPriceWeekday: d.ticketPriceWeekday,
        ticketPriceWeekend: d.ticketPriceWeekend,
        openingHours: d.openingHours || null,
        // Pengelola tidak boleh mengubah status publikasi.
        ...(isManager ? {} : { status: d.status }),
      },
      select: { slug: true },
    });
    revalidateDestinations(updated.slug);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Gagal memperbarui destinasi." };
  }
}

export async function deleteDestinationAction(id: string): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const imgs = await prisma.destinationImage.findMany({ where: { destinationId: id }, select: { url: true } });
    const deleted = await prisma.destination.delete({ where: { id }, select: { slug: true } });
    await removeByUrls(imgs.map((i) => i.url));
    revalidateDestinations(deleted.slug);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Gagal menghapus destinasi." };
  }
}
