"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { revalidatePath as revalidateRoute } from "next/cache";
import { invalidateContent } from "@/lib/cache";

/** Invalidate halaman + cache data publik sekaligus agar perubahan CMS langsung terlihat. */
const revalidatePath = (path: string, type?: "page" | "layout") => {
  revalidateRoute(path, type);
  invalidateContent();
};
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createLimiter } from "@/lib/rate-limit";
import { slugify } from "@/lib/utils";
import { authorize } from "@/server/auth/dal";
import { ADMIN_ONLY, CONTENT_ROLES } from "@/lib/auth/permissions";
import type { ActionResult } from "./cms-actions";

/* =====================================================================
 * PUBLIK (tanpa login): kontak, pengaduan, pendaftaran usaha/wisata, survei.
 * Perlindungan: validasi server, honeypot, pembatasan laju per IP (hash).
 * ===================================================================== */

const HOUR = 60 * 60 * 1000;
const perKindLimiter = createLimiter("service-kind", HOUR, 5); // 5 kiriman/jam per jenis per IP
const perIpLimiter = createLimiter("service-ip", HOUR, 15); // 15 kiriman/jam per IP

const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} wajib diisi` })
    .trim()
    .min(min, `${label} minimal ${min} karakter`)
    .max(max, `${label} maksimal ${max} karakter`);

const optionalText = (max: number) =>
  z.string().trim().max(max).nullish().transform((v) => v || "");

const phoneField = z
  .string()
  .trim()
  .max(25)
  .nullish()
  .transform((v) => v || "")
  .refine((v) => v === "" || /^[0-9+\s()-]{6,25}$/.test(v), "Nomor WhatsApp tidak valid");

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(200)
  .nullish()
  .transform((v) => v || "")
  .refine((v) => v === "" || z.string().email().safeParse(v).success, "Email tidak valid");

const base = {
  name: text(2, 100, "Nama"),
  email: emailField,
  phone: phoneField,
  website: z.string().nullish(), // honeypot: harus kosong
};

const serviceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("contact"),
    ...base,
    subject: text(3, 200, "Subjek"),
    message: text(5, 4000, "Pesan"),
  }),
  z.object({
    kind: z.literal("complaint"),
    ...base,
    subject: text(3, 200, "Subjek"),
    message: text(10, 4000, "Isi pengaduan"),
  }),
  z.object({
    kind: z.literal("registration"),
    ...base,
    businessKind: z.enum(["UMKM", "WISATA"]),
    businessName: text(3, 150, "Nama usaha/wisata"),
    district: text(2, 80, "Kecamatan"),
    address: optionalText(300),
    description: text(10, 3000, "Deskripsi"),
  }),
  z.object({
    kind: z.literal("survey"),
    name: optionalText(100),
    email: emailField,
    phone: phoneField,
    website: z.string().nullish(),
    rating: z.coerce.number().int().min(1, "Penilaian tidak valid").max(5, "Penilaian tidak valid"),
    message: text(3, 2000, "Kesan & saran"),
  }),
]);

export type ServiceInput = z.input<typeof serviceSchema>;

async function clientIpHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return createHash("sha256")
    .update(ip + (process.env.AUTH_SECRET ?? ""))
    .digest("hex")
    .slice(0, 32);
}

export async function submitServiceAction(input: unknown): Promise<ActionResult> {
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const d = parsed.data;

  // Honeypot terisi => bot. Pura-pura sukses agar bot tidak beradaptasi.
  if (d.website) return { success: true };

  // Selain survei, wajib ada cara dihubungi.
  if (d.kind !== "survey" && !d.email && !d.phone) {
    return { success: false, error: "Isi email atau nomor WhatsApp agar kami dapat menghubungi Anda." };
  }

  const ipHash = await clientIpHash();
  if (!perIpLimiter.take(ipHash) || !perKindLimiter.take(`${d.kind}|${ipHash}`)) {
    return { success: false, error: "Terlalu banyak kiriman dari jaringan Anda. Silakan coba lagi dalam satu jam." };
  }

  try {
    switch (d.kind) {
      case "contact":
      case "complaint":
        await prisma.publicSubmission.create({
          data: {
            type: d.kind === "contact" ? "CONTACT" : "COMPLAINT",
            senderName: d.name,
            senderEmail: d.email,
            senderPhone: d.phone || null,
            subject: d.subject,
            message: d.message,
            ipHash,
          },
        });
        break;
      case "registration":
        await prisma.publicSubmission.create({
          data: {
            type: "OPERATOR_REGISTRATION",
            senderName: d.name,
            senderEmail: d.email,
            senderPhone: d.phone || null,
            subject: `Pendaftaran ${d.businessKind === "UMKM" ? "UMKM" : "Wisata"}: ${d.businessName}`,
            message: d.description,
            payload: {
              kind: d.businessKind,
              businessName: d.businessName,
              district: d.district,
              address: d.address,
            },
            ipHash,
          },
        });
        break;
      case "survey":
        await prisma.publicSubmission.create({
          data: {
            type: "SURVEY",
            senderName: d.name || "Anonim",
            senderEmail: d.email,
            senderPhone: d.phone || null,
            subject: "Survei Kepuasan Wisatawan",
            message: d.message,
            rating: d.rating,
            ipHash,
          },
        });
        break;
    }
    revalidatePath("/admin/layanan");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal mengirim formulir. Silakan coba lagi." };
  }
}

/* =====================================================================
 * ADMIN: tangani pesan. SUPER_ADMIN & EDITOR; hapus hanya SUPER_ADMIN.
 * ===================================================================== */

const updateSchema = z.object({
  status: z.enum(["PENDING", "IN_REVIEW", "RESOLVED"]),
  notes: z.string().trim().max(2000, "Catatan maksimal 2000 karakter").nullish().transform((v) => v || null),
});

export async function updateSubmissionAction(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  const p = updateSchema.safeParse(input);
  if (!p.success) return { success: false, error: p.error.issues[0]?.message ?? "Data tidak valid." };
  try {
    await prisma.publicSubmission.update({
      where: { id },
      data: { status: p.data.status, notes: p.data.notes, handledById: auth.user.id },
    });
    revalidatePath("/admin/layanan");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menyimpan penanganan." };
  }
}

/** Pendaftaran UMKM disetujui -> dibuat sebagai DRAF UMKM (tidak langsung tayang). */
export async function approveRegistrationAction(id: string): Promise<ActionResult> {
  const auth = await authorize(CONTENT_ROLES);
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const sub = await prisma.publicSubmission.findUnique({ where: { id } });
    if (!sub || sub.type !== "OPERATOR_REGISTRATION") return { success: false, error: "Pendaftaran tidak ditemukan." };
    const payload = (sub.payload ?? {}) as Record<string, unknown>;
    if (payload.businessId) return { success: false, error: "Draf UMKM untuk pendaftaran ini sudah dibuat." };
    if (payload.kind !== "UMKM") {
      return { success: false, error: "Hanya pendaftaran UMKM yang dapat dibuat otomatis. Tindak lanjuti pendaftaran wisata secara manual." };
    }
    const name = String(payload.businessName ?? "").trim();
    const district = String(payload.district ?? "").trim();
    if (!name || !district) return { success: false, error: "Data pendaftaran tidak lengkap." };

    const root = slugify(name) || "umkm";
    let slug = root;
    for (let i = 2; await prisma.business.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${root}-${i}`;

    const business = await prisma.business.create({
      data: {
        name,
        slug,
        description: sub.message,
        district,
        address: String(payload.address ?? "").trim() || `Kec. ${district}, Kabupaten Purbalingga`,
        ownerName: sub.senderName,
        whatsappNumber: sub.senderPhone,
        status: "DRAFT",
      },
      select: { id: true },
    });
    const note = `Draf UMKM dibuat otomatis (${new Date().toISOString().slice(0, 10)}).`;
    await prisma.publicSubmission.update({
      where: { id },
      data: {
        status: "RESOLVED",
        handledById: auth.user.id,
        payload: { ...payload, businessId: business.id } as object,
        notes: sub.notes ? `${sub.notes}\n${note}` : note,
      },
    });
    revalidatePath("/admin/layanan");
    revalidatePath("/admin/umkm");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal membuat draf UMKM." };
  }
}

export async function deleteSubmissionAction(id: string): Promise<ActionResult> {
  const auth = await authorize(ADMIN_ONLY);
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    await prisma.publicSubmission.delete({ where: { id } });
    revalidatePath("/admin/layanan");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menghapus pesan." };
  }
}
