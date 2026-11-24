"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createLimiter } from "@/lib/rate-limit";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth/session";

export interface LoginState {
  error?: string;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

// Pembatas percobaan login: 5 gagal per email+IP, 30 gagal per IP (jaringan bersama tetap bisa masuk).
const WINDOW_MS = 15 * 60 * 1000;
const accountLimiter = createLimiter("login-account", WINDOW_MS, 5);
const ipLimiter = createLimiter("login-ip", WINDOW_MS, 30);

// Hash dummy supaya waktu respons sama baik user ada maupun tidak (cegah enumerasi email).
let dummyHash: string | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("tidak-dipakai", 12));

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Email atau kata sandi tidak valid." };
  const { email, password } = parsed.data;

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const accountKey = `${email}|${ip}`;
  if (accountLimiter.isLimited(accountKey) || ipLimiter.isLimited(ip)) {
    return { error: "Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, isActive: true },
  });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? getDummyHash());
  if (!user || !ok || !user.isActive) {
    accountLimiter.hit(accountKey);
    ipLimiter.hit(ip);
    return { error: "Email atau kata sandi salah, atau akun nonaktif." };
  }

  accountLimiter.clear(accountKey);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  (await cookies()).set(SESSION_COOKIE, await signSession(user.id), sessionCookieOptions);
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
