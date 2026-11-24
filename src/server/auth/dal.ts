import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import type { AppRole } from "@/lib/auth/permissions";

// Data Access Layer: batas keamanan yang sebenarnya. proxy.ts hanyalah pemeriksaan cepat.

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
}

/** Membaca cookie, memverifikasi JWT, lalu memuat user dari DB (role & isActive selalu segar). */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = await verifySession(token);
  if (!s) return null;
  const user = await prisma.user.findUnique({
    where: { id: s.userId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
});

/** Untuk halaman/layout: belum login -> /admin/login; peran tidak cukup -> /admin. */
export async function requirePageRole(allowed: AppRole[]): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!allowed.includes(user.role)) redirect("/admin");
  return user;
}

export type AuthResult = { ok: true; user: SessionUser } | { ok: false; error: string };

/** Untuk Server Action: mengembalikan hasil (bukan redirect) agar UI bisa menampilkan pesan. */
export async function authorize(allowed: AppRole[]): Promise<AuthResult> {
  const user = await getSession();
  if (!user) return { ok: false, error: "Sesi berakhir. Silakan masuk kembali." };
  if (!allowed.includes(user.role)) return { ok: false, error: "Anda tidak memiliki izin untuk aksi ini." };
  return { ok: true, user };
}

/** SUPER_ADMIN & EDITOR: semua destinasi. DESTINATION_MANAGER: hanya yang ditugaskan padanya. */
export async function canManageDestination(user: SessionUser, destinationId: string) {
  if (user.role === "SUPER_ADMIN" || user.role === "EDITOR") return true;
  if (user.role !== "DESTINATION_MANAGER") return false;
  const d = await prisma.destination.findUnique({ where: { id: destinationId }, select: { managerId: true } });
  return d?.managerId === user.id;
}
