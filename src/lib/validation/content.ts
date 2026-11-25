import { z } from "zod";

// Skema validasi bersama: dipakai Server Action (form admin) DAN impor Excel/CSV,
// sehingga aturan datanya selalu sama. Bukan file "use server" (boleh mengekspor nilai).

export const status = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED");
export const optional = (max: number) =>
  z.string().trim().max(max).nullish().transform((v) => v || undefined);
export const categoryId = z.string().trim().nullish().transform((v) => v || undefined);
// Checkbox dikirim sebagai boolean; "false" string tidak boleh dianggap true.
export const bool = z.union([z.boolean(), z.enum(["true", "false"]).transform((v) => v === "true")]).default(true);

/** URL gambar dari klien: kosong -> null; selain itu harus berasal dari bucket kita & objek ada. */
export const imageUrl = z.string().trim().max(500).nullish().transform((v) => v || null);

export const num = (min: number, max: number, label: string) =>
  z
    .union([z.string(), z.number()])
    .nullish()
    .transform((v, ctx) => {
      if (v === null || v === undefined || String(v).trim() === "") return null;
      const n = Number(String(v).replace(",", "."));
      if (!Number.isFinite(n) || n < min || n > max) {
        ctx.addIssue({ code: "custom", message: `${label} tidak valid` });
        return z.NEVER;
      }
      return n;
    });

export const culinarySchema = z
  .object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(150),
  description: z.string().trim().min(1, "Deskripsi wajib diisi").max(5000),
  district: z.string().trim().min(1, "Kecamatan wajib diisi").max(80),
  address: optional(300),
  priceRange: optional(80),
  isHalal: bool,
  latitude: num(-90, 90, "Latitude"),
  longitude: num(-180, 180, "Longitude"),
  imageUrl,
  categoryId,
  status,
  })
  .superRefine((v, ctx) => {
    if ((v.latitude === null) !== (v.longitude === null)) {
      ctx.addIssue({ code: "custom", message: "Isi latitude dan longitude bersamaan", path: ["latitude"] });
    }
  });

/** Input datetime-local ("YYYY-MM-DDTHH:mm", waktu WIB) -> Date. Kosong -> undefined. */
export const dateInput = z
  .string()
  .trim()
  .nullish()
  .transform((v) => {
    if (!v) return undefined;
    const iso = v.length === 10 ? `${v}T00:00:00+07:00` : `${v}:00+07:00`;
    return new Date(iso);
  });

export const eventSchema = z
  .object({
    title: z.string().trim().min(3, "Judul minimal 3 karakter").max(200),
    description: z.string().trim().min(1, "Deskripsi wajib diisi").max(5000),
    location: z.string().trim().min(1, "Lokasi wajib diisi").max(200),
    organizer: optional(150),
    startDate: dateInput,
    endDate: dateInput,
    bannerUrl: imageUrl,
    categoryId,
    status,
  })
  .superRefine((v, ctx) => {
    if (!v.startDate || isNaN(v.startDate.getTime())) {
      ctx.addIssue({ code: "custom", message: "Tanggal mulai wajib diisi", path: ["startDate"] });
    } else if (v.endDate && (isNaN(v.endDate.getTime()) || v.endDate < v.startDate)) {
      ctx.addIssue({ code: "custom", message: "Tanggal selesai harus setelah tanggal mulai", path: ["endDate"] });
    }
  });

export const businessSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(150),
  description: z.string().trim().min(1, "Deskripsi wajib diisi").max(5000),
  district: z.string().trim().min(1, "Kecamatan wajib diisi").max(80),
  address: optional(300),
  ownerName: optional(120),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{0,20}$/, "Nomor WhatsApp tidak valid")
    .nullish()
    .transform((v) => v || undefined),
  features: z
    .string()
    .nullish()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10)
    ),
  logoUrl: imageUrl,
  categoryId,
  status,
});



export const destinationSchema = z
  .object({
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
  latitude: num(-90, 90, "Latitude"),
  longitude: num(-180, 180, "Longitude"),
  managerId: z.string().trim().nullish().transform((v) => v || null),
  })
  .superRefine((v, ctx) => {
    if ((v.latitude === null) !== (v.longitude === null)) {
      ctx.addIssue({ code: "custom", message: "Isi latitude dan longitude bersamaan", path: ["latitude"] });
    }
  });

/* ----------------------------- Akomodasi ---------------------------- */

/** Hanya http/https — mencegah tautan berbahaya seperti javascript:. */
const webUrl = z
  .string()
  .trim()
  .max(300)
  .nullish()
  .transform((v) => v || null)
  .refine((v) => {
    if (v === null) return true;
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, "Alamat website harus diawali http:// atau https://");

export const ACCOMMODATION_TYPES = ["HOTEL", "HOMESTAY", "VILLA", "GUESTHOUSE", "CAMPING", "OTHER"] as const;
export const ACCOMMODATION_TYPE_LABEL: Record<(typeof ACCOMMODATION_TYPES)[number], string> = {
  HOTEL: "Hotel",
  HOMESTAY: "Homestay",
  VILLA: "Villa",
  GUESTHOUSE: "Guest House / Penginapan",
  CAMPING: "Camping Ground",
  OTHER: "Lainnya",
};

export const accommodationSchema = z
  .object({
    name: z.string().trim().min(3, "Nama minimal 3 karakter").max(150),
    type: z.enum(ACCOMMODATION_TYPES, { error: "Jenis akomodasi tidak valid" }).default("HOMESTAY"),
    description: z.string().trim().min(1, "Deskripsi wajib diisi").max(5000),
    district: z.string().trim().min(1, "Kecamatan wajib diisi").max(80),
    address: optional(300),
    latitude: num(-90, 90, "Latitude"),
    longitude: num(-180, 180, "Longitude"),
    priceFrom: num(0, 100_000_000, "Harga mulai"),
    priceTo: num(0, 100_000_000, "Harga sampai"),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\s()-]{0,25}$/, "Nomor telepon tidak valid")
      .nullish()
      .transform((v) => v || null),
    whatsappNumber: z
      .string()
      .trim()
      .regex(/^[0-9+\s()-]{0,25}$/, "Nomor WhatsApp tidak valid")
      .nullish()
      .transform((v) => v || null),
    websiteUrl: webUrl,
    facilities: z
      .string()
      .nullish()
      .transform((v) =>
        (v ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 20)
      ),
    imageUrl,
    status,
  })
  .superRefine((v, ctx) => {
    if ((v.latitude === null) !== (v.longitude === null)) {
      ctx.addIssue({ code: "custom", message: "Isi latitude dan longitude bersamaan", path: ["latitude"] });
    }
    if (v.priceFrom !== null && v.priceTo !== null && v.priceTo < v.priceFrom) {
      ctx.addIssue({ code: "custom", message: "Harga sampai harus >= harga mulai", path: ["priceTo"] });
    }
  });
