"use server";

import { revalidatePath as revalidateRoute } from "next/cache";
import { invalidateContent } from "@/lib/cache";

/** Invalidate halaman + cache data publik sekaligus agar perubahan CMS langsung terlihat. */
const revalidatePath = (path: string, type?: "page" | "layout") => {
  revalidateRoute(path, type);
  invalidateContent();
};
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/server/auth/dal";
import { ADMIN_ONLY } from "@/lib/auth/permissions";
import type { ActionResult } from "./cms-actions";

// Semua action pengguna hanya untuk SUPER_ADMIN, divalidasi di server.

const baseSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(120),
  email: z.string().trim().toLowerCase().email("Email tidak valid").max(200),
  role: z.enum(["SUPER_ADMIN", "EDITOR", "DESTINATION_MANAGER"]),
  phone: z.string().trim().max(30).nullish().transform((v) => v || null),
  isActive: z.union([z.boolean(), z.enum(["true", "false"]).transform((v) => v === "true")]).default(true),
  destinationIds: z
    .string()
    .nullish()
    .transform((v) => (v ?? "").split(",").map((x) => x.trim()).filter(Boolean)),
});

const passwordRule = z.string().min(8, "Kata sandi minimal 8 karakter").max(100);
const createSchema = baseSchema.extend({ password: passwordRule });
const updateSchema = baseSchema.extend({
  password: z.string().max(100).nullish().transform((v) => v || undefined),
});

const first = (e: z.ZodError) => e.issues[0]?.message ?? "Data tidak valid.";

function revalidateUsers() {
  revalidatePath("/admin/pengguna");
  revalidatePath("/admin/destinasi");
}

async function otherActiveAdmins(excludeId: string) {
  return prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true, id: { not: excludeId } } });
}

/** Sinkronkan penugasan destinasi: pengelola hanya memegang destinasi dalam daftar. */
async function syncAssignments(userId: string, role: string, destinationIds: string[]) {
  const ids = role === "DESTINATION_MANAGER" ? destinationIds : [];
  await prisma.$transaction([
    prisma.destination.updateMany({
      where: { managerId: userId, id: { notIn: ids } },
      data: { managerId: null },
    }),
    ...(ids.length
      ? [prisma.destination.updateMany({ where: { id: { in: ids } }, data: { managerId: userId } })]
      : []),
  ]);
}

function isUniqueViolation(e: unknown) {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";
}

export async function createUserAction(input: unknown): Promise<ActionResult> {
  const auth = await authorize(ADMIN_ONLY);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = createSchema.safeParse(input);
  if (!p.success) return { success: false, error: first(p.error) };
  const { password, destinationIds, ...d } = p.data;
  try {
    const user = await prisma.user.create({
      data: { ...d, passwordHash: await bcrypt.hash(password, 12) },
      select: { id: true },
    });
    await syncAssignments(user.id, d.role, destinationIds);
    revalidateUsers();
    return { success: true };
  } catch (e) {
    if (isUniqueViolation(e)) return { success: false, error: "Email sudah terdaftar." };
    console.error(e);
    return { success: false, error: "Gagal menyimpan pengguna." };
  }
}

export async function updateUserAction(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorize(ADMIN_ONLY);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = updateSchema.safeParse(input);
  if (!p.success) return { success: false, error: first(p.error) };
  const { password, destinationIds, ...d } = p.data;
  if (password) {
    const pw = passwordRule.safeParse(password);
    if (!pw.success) return { success: false, error: first(pw.error) };
  }
  try {
    const current = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } });
    if (!current) return { success: false, error: "Pengguna tidak ditemukan." };

    const losesAdmin = current.role === "SUPER_ADMIN" && current.isActive && (d.role !== "SUPER_ADMIN" || !d.isActive);
    if (losesAdmin) {
      if (id === auth.user.id) {
        return { success: false, error: "Anda tidak dapat menurunkan peran atau menonaktifkan akun sendiri." };
      }
      if ((await otherActiveAdmins(id)) === 0) {
        return { success: false, error: "Harus tersisa minimal satu Super Admin aktif." };
      }
    }
    if (id === auth.user.id && !d.isActive) {
      return { success: false, error: "Anda tidak dapat menonaktifkan akun sendiri." };
    }

    await prisma.user.update({
      where: { id },
      data: { ...d, ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}) },
    });
    await syncAssignments(id, d.role, destinationIds);
    revalidateUsers();
    return { success: true };
  } catch (e) {
    if (isUniqueViolation(e)) return { success: false, error: "Email sudah terdaftar." };
    console.error(e);
    return { success: false, error: "Gagal memperbarui pengguna." };
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  const auth = await authorize(ADMIN_ONLY);
  if (!auth.ok) return { success: false, error: auth.error };
  if (id === auth.user.id) return { success: false, error: "Anda tidak dapat menghapus akun sendiri." };
  try {
    const u = await prisma.user.findUnique({
      where: { id },
      select: { role: true, isActive: true, _count: { select: { articles: true } } },
    });
    if (!u) return { success: false, error: "Pengguna tidak ditemukan." };
    if (u._count.articles > 0) {
      return { success: false, error: `Pengguna memiliki ${u._count.articles} artikel. Nonaktifkan akun saja.` };
    }
    if (u.role === "SUPER_ADMIN" && u.isActive && (await otherActiveAdmins(id)) === 0) {
      return { success: false, error: "Harus tersisa minimal satu Super Admin aktif." };
    }
    await prisma.user.delete({ where: { id } }); // destinasi yang ditugaskan: managerId -> null (SetNull)
    revalidateUsers();
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menghapus pengguna." };
  }
}
