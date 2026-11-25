import type { ZodType } from "zod";
import { prisma } from "@/lib/prisma";
import {
  accommodationSchema,
  businessSchema,
  culinarySchema,
  destinationSchema,
  eventSchema,
  ACCOMMODATION_TYPES,
  ACCOMMODATION_TYPE_LABEL,
} from "@/lib/validation/content";
import { createDestinationAction, updateDestinationAction, type ActionResult } from "@/server/actions/cms-actions";
import {
  createCulinaryAction,
  updateCulinaryAction,
  createBusinessAction,
  updateBusinessAction,
  createEventAction,
  updateEventAction,
} from "@/server/actions/content-actions";
import { createAccommodationAction, updateAccommodationAction } from "@/server/actions/accommodation-actions";

export type EntityKey = "destinasi" | "kuliner" | "umkm" | "event" | "akomodasi" | "layanan";
export type Cell = string | number | boolean | null;
export type Row = Record<string, string>;

export interface Col {
  key: string;
  required?: boolean;
}

export interface Prepared {
  mode: "create" | "update";
  id?: string;
  label: string;
  input: Record<string, unknown>;
}

export interface EntityIO {
  key: EntityKey;
  label: string;
  columns: Col[];
  example: Record<string, string>;
  exportRows(): Promise<Record<string, Cell>[]>;
  /** Hanya entitas yang bisa diimpor. */
  importer?: {
    schema: ZodType;
    prepare(row: Row): Promise<Prepared | { error: string }>;
    create(input: unknown): Promise<ActionResult>;
    update(id: string, input: unknown): Promise<ActionResult>;
  };
}

/* ------------------------------ util ------------------------------ */

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const yesNo = (b: boolean) => (b ? "ya" : "tidak");

function parseBool(v: string, fallback: boolean): boolean {
  const n = norm(v);
  if (!n) return fallback;
  if (["ya", "y", "yes", "true", "1", "halal"].includes(n)) return true;
  if (["tidak", "t", "no", "false", "0"].includes(n)) return false;
  return fallback;
}

function parseStatus(v: string, fallback: string): string {
  const n = norm(v);
  if (!n) return fallback;
  const map: Record<string, string> = {
    published: "PUBLISHED", terbit: "PUBLISHED", tayang: "PUBLISHED",
    draft: "DRAFT", draf: "DRAFT",
    archived: "ARCHIVED", arsip: "ARCHIVED",
  };
  return map[n] ?? n.toUpperCase();
}

/** Tanggal dari sel: "2026-12-20", "2026-12-20 09:00", "20/12/2026 09:00" -> "YYYY-MM-DDTHH:mm" (WIB). */
function parseDateTime(v: string): string {
  const s = v.trim();
  if (!s) return "";
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}T${(m[4] ?? "00").padStart(2, "0")}:${m[5] ?? "00"}`;
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2})[:.](\d{2}))?/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}T${(m[4] ?? "00").padStart(2, "0")}:${m[5] ?? "00"}`;
  return s; // biarkan validator menolak dengan pesan yang jelas
}

const wib = (d: Date | null) => (d ? new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 16).replace("T", " ") : "");

type Cat = { id: string; name: string; slug: string };
async function categories(type: "CULINARY" | "EVENT" | "UMKM" | "DESTINATION"): Promise<Cat[]> {
  return prisma.category.findMany({ where: { type }, select: { id: true, name: true, slug: true } });
}
function findCategory(rows: Cat[], raw: string): Cat | { error: string } | null {
  const k = norm(raw);
  if (!k) return null;
  const hit = rows.find((r) => norm(r.name) === k || norm(r.slug) === k || norm(r.slug.replace(/^(kuliner|event|umkm)-/, "")) === k);
  return hit ?? { error: `Kategori "${raw}" tidak dikenal. Pilihan: ${rows.map((r) => r.name).join(", ")}` };
}
const isErr = (x: unknown): x is { error: string } => typeof x === "object" && x !== null && "error" in x;

/* ---------------------------- Destinasi ---------------------------- */

const destinasi: EntityIO = {
  key: "destinasi",
  label: "Destinasi Wisata",
  columns: [
    { key: "slug" }, { key: "nama", required: true }, { key: "kategori", required: true }, { key: "kecamatan", required: true },
    { key: "alamat" }, { key: "ringkasan" }, { key: "deskripsi" }, { key: "harga_hari_kerja" }, { key: "harga_akhir_pekan" },
    { key: "jam_buka" }, { key: "latitude" }, { key: "longitude" }, { key: "status" },
  ],
  example: { slug: "", nama: "Curug Contoh", kategori: "Wisata Air", kecamatan: "Karangreja", alamat: "Desa Contoh", ringkasan: "Curug sejuk di lereng Slamet", deskripsi: "Deskripsi lengkap destinasi.", harga_hari_kerja: "10000", harga_akhir_pekan: "15000", jam_buka: "08.00 - 17.00 WIB", latitude: "-7.2500", longitude: "109.2000", status: "DRAFT" },
  async exportRows() {
    const rows = await prisma.destination.findMany({ include: { category: true }, orderBy: { createdAt: "asc" } });
    return rows.map((r) => ({
      slug: r.slug, nama: r.name, kategori: r.category.name, kecamatan: r.district, alamat: r.address, ringkasan: r.summary,
      deskripsi: r.description, harga_hari_kerja: r.ticketPriceWeekday ?? 0, harga_akhir_pekan: r.ticketPriceWeekend ?? 0,
      jam_buka: r.openingHours ?? "", latitude: r.latitude, longitude: r.longitude, status: r.status,
    }));
  },
  importer: {
    schema: destinationSchema,
    async prepare(row) {
      const existing = row.slug ? await prisma.destination.findUnique({ where: { slug: row.slug }, select: { id: true, managerId: true, status: true, latitude: true, longitude: true } }) : null;
      const cat = findCategory(await categories("DESTINATION"), row.kategori);
      if (!cat) return { error: "Kategori wajib diisi" };
      if (isErr(cat)) return cat;
      return {
        mode: existing ? "update" : "create",
        id: existing?.id,
        label: row.nama,
        input: {
          name: row.nama, categorySlug: cat.slug, district: row.kecamatan, address: row.alamat || undefined,
          summary: row.ringkasan || undefined, description: row.deskripsi || undefined,
          ticketPriceWeekday: row.harga_hari_kerja || "0", ticketPriceWeekend: row.harga_akhir_pekan || "0",
          openingHours: row.jam_buka || undefined, status: parseStatus(row.status, existing?.status ?? "DRAFT"),
          managerId: existing?.managerId ?? null, // jangan menghapus penugasan pengelola saat impor
          // Sel koordinat kosong pada baris yang diperbarui = pertahankan koordinat lama (tidak menghapus).
          latitude: row.latitude || row.longitude ? row.latitude : (existing?.latitude ?? null),
          longitude: row.latitude || row.longitude ? row.longitude : (existing?.longitude ?? null),
        },
      };
    },
    create: (i) => createDestinationAction(i as never),
    update: (id, i) => updateDestinationAction(id, i as never),
  },
};

/* ------------------------------ Kuliner ---------------------------- */

const kuliner: EntityIO = {
  key: "kuliner",
  label: "Kuliner & Oleh-Oleh",
  columns: [
    { key: "slug" }, { key: "nama", required: true }, { key: "kategori" }, { key: "kecamatan", required: true },
    { key: "alamat" }, { key: "kisaran_harga" }, { key: "deskripsi", required: true }, { key: "halal" },
    { key: "latitude" }, { key: "longitude" }, { key: "status" },
  ],
  example: { slug: "", nama: "Mendoan Contoh", kategori: "Cemilan & Jajanan", kecamatan: "Purbalingga", alamat: "", kisaran_harga: "Rp 5.000 - Rp 15.000", deskripsi: "Tempe mendoan hangat.", halal: "ya", latitude: "-7.3880", longitude: "109.3600", status: "DRAFT" },
  async exportRows() {
    const rows = await prisma.culinary.findMany({ include: { category: true }, orderBy: { createdAt: "asc" } });
    return rows.map((r) => ({
      slug: r.slug, nama: r.name, kategori: r.category?.name ?? "", kecamatan: r.district, alamat: r.address,
      kisaran_harga: r.priceRange ?? "", deskripsi: r.description, halal: yesNo(r.isHalal), latitude: r.latitude, longitude: r.longitude, status: r.status,
    }));
  },
  importer: {
    schema: culinarySchema,
    async prepare(row) {
      const existing = row.slug ? await prisma.culinary.findUnique({ where: { slug: row.slug }, select: { id: true, imageUrl: true, status: true, latitude: true, longitude: true } }) : null;
      const cat = findCategory(await categories("CULINARY"), row.kategori);
      if (isErr(cat)) return cat;
      return {
        mode: existing ? "update" : "create", id: existing?.id, label: row.nama,
        input: {
          name: row.nama, description: row.deskripsi, district: row.kecamatan, address: row.alamat || undefined,
          priceRange: row.kisaran_harga || undefined, isHalal: parseBool(row.halal, true), categoryId: cat?.id,
          status: parseStatus(row.status, existing?.status ?? "DRAFT"), imageUrl: existing?.imageUrl ?? null,
          // Sel koordinat kosong pada baris yang diperbarui = pertahankan koordinat lama.
          latitude: row.latitude || row.longitude ? row.latitude : (existing?.latitude ?? null),
          longitude: row.latitude || row.longitude ? row.longitude : (existing?.longitude ?? null),
        },
      };
    },
    create: (i) => createCulinaryAction(i),
    update: (id, i) => updateCulinaryAction(id, i),
  },
};

/* -------------------------------- UMKM ----------------------------- */

const umkm: EntityIO = {
  key: "umkm",
  label: "UMKM & Produk",
  columns: [
    { key: "slug" }, { key: "nama", required: true }, { key: "kategori" }, { key: "kecamatan", required: true }, { key: "alamat" },
    { key: "pemilik" }, { key: "whatsapp" }, { key: "keunggulan" }, { key: "deskripsi", required: true }, { key: "status" },
  ],
  example: { slug: "", nama: "Keripik Contoh", kategori: "", kecamatan: "Kalimanah", alamat: "", pemilik: "Bu Sri", whatsapp: "081234567890", keunggulan: "Renyah, Tanpa pengawet", deskripsi: "Keripik rumahan.", status: "DRAFT" },
  async exportRows() {
    const rows = await prisma.business.findMany({ include: { category: true }, orderBy: { createdAt: "asc" } });
    return rows.map((r) => ({
      slug: r.slug, nama: r.name, kategori: r.category?.name ?? "", kecamatan: r.district, alamat: r.address,
      pemilik: r.ownerName ?? "", whatsapp: r.whatsappNumber ?? "", keunggulan: r.features.join(", "), deskripsi: r.description, status: r.status,
    }));
  },
  importer: {
    schema: businessSchema,
    async prepare(row) {
      const existing = row.slug ? await prisma.business.findUnique({ where: { slug: row.slug }, select: { id: true, logoUrl: true, status: true } }) : null;
      const cat = findCategory(await categories("UMKM"), row.kategori);
      if (isErr(cat)) return cat;
      return {
        mode: existing ? "update" : "create", id: existing?.id, label: row.nama,
        input: {
          name: row.nama, description: row.deskripsi, district: row.kecamatan, address: row.alamat || undefined,
          ownerName: row.pemilik || undefined, whatsappNumber: row.whatsapp || undefined, features: row.keunggulan,
          categoryId: cat?.id, status: parseStatus(row.status, existing?.status ?? "DRAFT"), logoUrl: existing?.logoUrl ?? null,
        },
      };
    },
    create: (i) => createBusinessAction(i),
    update: (id, i) => updateBusinessAction(id, i),
  },
};

/* -------------------------------- Event ---------------------------- */

const event: EntityIO = {
  key: "event",
  label: "Kalender Event",
  columns: [
    { key: "slug" }, { key: "judul", required: true }, { key: "kategori" }, { key: "lokasi", required: true },
    { key: "mulai", required: true }, { key: "selesai" }, { key: "penyelenggara" }, { key: "deskripsi", required: true }, { key: "status" },
  ],
  example: { slug: "", judul: "Festival Contoh", kategori: "", lokasi: "Alun-Alun Purbalingga", mulai: "2027-08-17 09:00", selesai: "2027-08-18 17:00", penyelenggara: "Disporapar", deskripsi: "Deskripsi acara.", status: "DRAFT" },
  async exportRows() {
    const rows = await prisma.event.findMany({ include: { category: true }, orderBy: { startDate: "asc" } });
    return rows.map((r) => ({
      slug: r.slug, judul: r.title, kategori: r.category?.name ?? "", lokasi: r.location, mulai: wib(r.startDate), selesai: wib(r.endDate),
      penyelenggara: r.organizer ?? "", deskripsi: r.description, status: r.status,
    }));
  },
  importer: {
    schema: eventSchema,
    async prepare(row) {
      const existing = row.slug ? await prisma.event.findUnique({ where: { slug: row.slug }, select: { id: true, bannerUrl: true, status: true } }) : null;
      const cat = findCategory(await categories("EVENT"), row.kategori);
      if (isErr(cat)) return cat;
      return {
        mode: existing ? "update" : "create", id: existing?.id, label: row.judul,
        input: {
          title: row.judul, description: row.deskripsi, location: row.lokasi, organizer: row.penyelenggara || undefined,
          startDate: parseDateTime(row.mulai), endDate: parseDateTime(row.selesai), categoryId: cat?.id,
          status: parseStatus(row.status, existing?.status ?? "DRAFT"), bannerUrl: existing?.bannerUrl ?? null,
        },
      };
    },
    create: (i) => createEventAction(i),
    update: (id, i) => updateEventAction(id, i),
  },
};

/* ------------------------------ Akomodasi -------------------------- */

const typeFromText = (raw: string): string => {
  const k = norm(raw);
  if (!k) return "";
  const hit = ACCOMMODATION_TYPES.find((t) => norm(t) === k || norm(ACCOMMODATION_TYPE_LABEL[t]) === k);
  return hit ?? raw.toUpperCase();
};

const akomodasi: EntityIO = {
  key: "akomodasi",
  label: "Akomodasi & Penginapan",
  columns: [
    { key: "slug" }, { key: "nama", required: true }, { key: "jenis", required: true }, { key: "kecamatan", required: true }, { key: "alamat" },
    { key: "latitude" }, { key: "longitude" }, { key: "tarif_mulai" }, { key: "tarif_sampai" }, { key: "telepon" }, { key: "whatsapp" },
    { key: "website" }, { key: "fasilitas" }, { key: "deskripsi", required: true }, { key: "status" },
  ],
  example: { slug: "", nama: "Homestay Contoh", jenis: "Homestay", kecamatan: "Karangreja", alamat: "Desa Contoh", latitude: "-7.2500", longitude: "109.2000", tarif_mulai: "150000", tarif_sampai: "300000", telepon: "", whatsapp: "081234567890", website: "", fasilitas: "Wi-Fi, Sarapan, Parkir", deskripsi: "Homestay nyaman.", status: "DRAFT" },
  async exportRows() {
    const rows = await prisma.accommodation.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((r) => ({
      slug: r.slug, nama: r.name, jenis: ACCOMMODATION_TYPE_LABEL[r.type], kecamatan: r.district, alamat: r.address,
      latitude: r.latitude, longitude: r.longitude, tarif_mulai: r.priceFrom, tarif_sampai: r.priceTo, telepon: r.phone ?? "",
      whatsapp: r.whatsappNumber ?? "", website: r.websiteUrl ?? "", fasilitas: r.facilities.join(", "), deskripsi: r.description, status: r.status,
    }));
  },
  importer: {
    schema: accommodationSchema,
    async prepare(row) {
      const existing = row.slug ? await prisma.accommodation.findUnique({ where: { slug: row.slug }, select: { id: true, imageUrl: true, status: true } }) : null;
      return {
        mode: existing ? "update" : "create", id: existing?.id, label: row.nama,
        input: {
          name: row.nama, type: typeFromText(row.jenis) || "HOMESTAY", description: row.deskripsi, district: row.kecamatan,
          address: row.alamat || undefined, latitude: row.latitude, longitude: row.longitude, priceFrom: row.tarif_mulai, priceTo: row.tarif_sampai,
          phone: row.telepon, whatsappNumber: row.whatsapp, websiteUrl: row.website, facilities: row.fasilitas,
          status: parseStatus(row.status, existing?.status ?? "DRAFT"), imageUrl: existing?.imageUrl ?? null,
        },
      };
    },
    create: (i) => createAccommodationAction(i),
    update: (id, i) => updateAccommodationAction(id, i),
  },
};

/* ------------------- Layanan publik (hanya ekspor) ------------------ */

const layanan: EntityIO = {
  key: "layanan",
  label: "Layanan Publik (pesan masuk)",
  columns: ["tanggal", "jenis", "status", "nama", "email", "whatsapp", "subjek", "pesan", "rating", "catatan", "ditangani_oleh"].map((key) => ({ key })),
  example: {},
  async exportRows() {
    const rows = await prisma.publicSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 5000, include: { handledBy: { select: { name: true } } } });
    return rows.map((r) => ({
      tanggal: wib(r.createdAt), jenis: r.type, status: r.status, nama: r.senderName, email: r.senderEmail, whatsapp: r.senderPhone ?? "",
      subjek: r.subject, pesan: r.message, rating: r.rating, catatan: r.notes ?? "", ditangani_oleh: r.handledBy?.name ?? "",
    }));
  },
};

export const ENTITIES: Record<EntityKey, EntityIO> = { destinasi, kuliner, umkm, event, akomodasi, layanan };
export const isEntityKey = (k: string): k is EntityKey => k in ENTITIES;
