"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { authorize } from "@/server/auth/dal";
import { CONTENT_ROLES } from "@/lib/auth/permissions";
import { removeByUrls, verifyImageUrl } from "@/server/storage/storage";
import { accommodationSchema } from "@/lib/validation/content";
import type { ActionResult } from "./cms-actions";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/akomodasi");
  revalidatePath("/peta");
  revalidatePath("/admin/akomodasi");
}

const IMAGE_ERROR = "Foto tidak valid atau belum terunggah.";

export async function createAccommodationAction(input: unknown): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = accommodationSchema.safeParse(input);
  if (!p.success) return { success: false, error: p.error.issues[0]?.message ?? "Data tidak valid." };
  const d = p.data;
  try {
    if (d.imageUrl && !(await verifyImageUrl(d.imageUrl))) return { success: false, error: IMAGE_ERROR };
    const root = slugify(d.name) || "akomodasi";
    let slug = root;
    for (let i = 2; await prisma.accommodation.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${root}-${i}`;
    await prisma.accommodation.create({
      data: { ...d, slug, address: d.address ?? `Kec. ${d.district}, Kabupaten Purbalingga` },
    });
    revalidateAll();
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menyimpan akomodasi." };
  }
}

export async function updateAccommodationAction(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = accommodationSchema.safeParse(input);
  if (!p.success) return { success: false, error: p.error.issues[0]?.message ?? "Data tidak valid." };
  const d = p.data;
  try {
    if (d.imageUrl && !(await verifyImageUrl(d.imageUrl))) return { success: false, error: IMAGE_ERROR };
    const old = await prisma.accommodation.findUnique({ where: { id }, select: { imageUrl: true } });
    if (!old) return { success: false, error: "Akomodasi tidak ditemukan." };
    await prisma.accommodation.update({
      where: { id },
      data: { ...d, address: d.address ?? `Kec. ${d.district}, Kabupaten Purbalingga` },
    });
    if (old.imageUrl && old.imageUrl !== d.imageUrl) await removeByUrls([old.imageUrl]);
    revalidateAll();
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal memperbarui akomodasi." };
  }
}

export async function deleteAccommodationAction(id: string): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const old = await prisma.accommodation.findUnique({ where: { id }, select: { imageUrl: true } });
    await prisma.accommodation.delete({ where: { id } });
    await removeByUrls([old?.imageUrl]);
    revalidateAll();
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menghapus akomodasi." };
  }
}
