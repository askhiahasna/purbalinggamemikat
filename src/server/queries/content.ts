import { cached } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { toWibIso } from "@/lib/seo";

const tz = "Asia/Jakarta";
const fmtDay = new Intl.DateTimeFormat("id-ID", { day: "2-digit", timeZone: tz });
const fmtFull = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: tz });
const fmtMonthYear = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: tz });

export function formatDateId(d: Date) {
  return fmtFull.format(d);
}

/** "12 - 14 Juli 2026" atau "25 Agustus 2026" */
export function formatDateRange(start: Date, end: Date | null) {
  if (!end || fmtFull.format(end) === fmtFull.format(start)) return fmtFull.format(start);
  if (fmtMonthYear.format(end) === fmtMonthYear.format(start)) {
    return `${fmtDay.format(start)} - ${fmtFull.format(end)}`;
  }
  return `${fmtFull.format(start)} - ${fmtFull.format(end)}`;
}

export function readTimeLabel(text: string) {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} menit`;
}

/* ------------------------------ Publik ------------------------------ */

async function getPublishedCulinaryUncached(take?: number) {
  const rows = await prisma.culinary.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { createdAt: "asc" },
    take,
  });
  return rows.map((r) => ({
    id: r.slug,
    name: r.name,
    category: (r.category?.slug ?? "").replace(/^kuliner-/, ""),
    district: r.district,
    priceRange: r.priceRange ?? "-",
    categoryLabel: r.category?.name ?? "Kuliner",
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    desc: r.description,
    isHalal: r.isHalal,
    imageUrl: r.imageUrl,
  }));
}

export type PublicCulinary = Awaited<ReturnType<typeof getPublishedCulinary>>[number];

async function getPublishedCulinaryBySlugUncached(slug: string): Promise<PublicCulinary | null> {
  // Memakai versi tanpa cache: cache bersarang membuat entri slug tidak ikut ter-invalidate.
  const all = await getPublishedCulinaryUncached();
  return all.find((c) => c.id === slug) ?? null;
}

async function getPublishedEventsUncached(take?: number) {
  const rows = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { startDate: "asc" },
    take,
  });
  return rows.map((r) => ({
    id: r.slug,
    title: r.title,
    date: formatDateRange(r.startDate, r.endDate),
    location: r.location,
    category: r.category?.name ?? "Event",
    desc: r.description,
    imageUrl: r.bannerUrl,
    startISO: toWibIso(r.startDate),
    endISO: r.endDate ? toWibIso(r.endDate) : null,
  }));
}

async function getPublishedBusinessesUncached() {
  const rows = await prisma.business.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.slug,
    name: r.name,
    district: r.district,
    tag: r.category?.name ?? "UMKM",
    desc: r.description,
    features: r.features,
    imageUrl: r.logoUrl,
  }));
}

async function getPublishedArticlesUncached(take?: number) {
  const rows = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take,
  });
  return rows.map((r) => ({
    id: r.slug,
    title: r.title,
    category: r.category?.name ?? "Berita",
    date: formatDateId(r.publishedAt ?? r.createdAt),
    readTime: readTimeLabel(r.content),
    desc: r.excerpt,
    imageUrl: r.coverImageUrl,
  }));
}

/* ------------------------------- Admin ------------------------------ */

async function getCategoriesByTypeUncached(type: "CULINARY" | "EVENT" | "UMKM" | "ARTICLE") {
  return prisma.category.findMany({
    where: { type },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });
}

export async function getCulinaryForAdmin() {
  const rows = await prisma.culinary.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    district: r.district,
    address: r.address,
    priceRange: r.priceRange ?? "",
    isHalal: r.isHalal,
    imageUrl: r.imageUrl ?? "",
    latitude: r.latitude === null ? "" : String(r.latitude),
    longitude: r.longitude === null ? "" : String(r.longitude),
    status: r.status,
    categoryId: r.categoryId ?? "",
    categoryName: r.category?.name ?? "-",
  }));
}

// datetime-local memakai waktu lokal WIB (UTC+7)
const toLocalInput = (d: Date | null) =>
  d ? new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 16) : "";

export async function getEventsForAdmin() {
  const rows = await prisma.event.findMany({ include: { category: true }, orderBy: { startDate: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    location: r.location,
    organizer: r.organizer ?? "",
    bannerUrl: r.bannerUrl ?? "",
    startDate: toLocalInput(r.startDate),
    endDate: toLocalInput(r.endDate),
    dateLabel: formatDateRange(r.startDate, r.endDate),
    status: r.status,
    categoryId: r.categoryId ?? "",
    categoryName: r.category?.name ?? "-",
  }));
}

export async function getBusinessesForAdmin() {
  const rows = await prisma.business.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    district: r.district,
    address: r.address,
    ownerName: r.ownerName ?? "",
    whatsappNumber: r.whatsappNumber ?? "",
    features: r.features.join(", "),
    logoUrl: r.logoUrl ?? "",
    status: r.status,
    categoryId: r.categoryId ?? "",
    categoryName: r.category?.name ?? "-",
  }));
}

export async function getArticlesForAdmin() {
  const rows = await prisma.article.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    coverImageUrl: r.coverImageUrl ?? "",
    status: r.status,
    dateLabel: formatDateId(r.publishedAt ?? r.createdAt),
    categoryId: r.categoryId ?? "",
    categoryName: r.category?.name ?? "-",
  }));
}

export async function getReviewsForModeration() {
  const rows = await prisma.review.findMany({
    include: { destination: { select: { name: true } } },
    orderBy: [{ isApproved: "asc" }, { createdAt: "desc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    destination: r.destination.name,
    author: r.authorName,
    rating: r.rating,
    date: formatDateId(r.createdAt),
    comment: r.comment,
    approved: r.isApproved,
  }));
}

/** Detail berita untuk halaman publik /berita/[slug] (hanya yang terbit). */
async function getPublishedArticleBySlugUncached(slug: string) {
  const r = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true },
  });
  if (!r) return null;
  const published = r.publishedAt ?? r.createdAt;
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    category: r.category?.name ?? "Berita",
    coverImageUrl: r.coverImageUrl,
    publishedISO: toWibIso(published),
    modifiedISO: toWibIso(r.updatedAt),
    dateLabel: formatDateId(published),
    readTime: readTimeLabel(r.content),
  };
}

export const getPublishedCulinary = cached(getPublishedCulinaryUncached, "getPublishedCulinary");

export const getPublishedCulinaryBySlug = cached(getPublishedCulinaryBySlugUncached, "getPublishedCulinaryBySlug");

export const getPublishedEvents = cached(getPublishedEventsUncached, "getPublishedEvents");

export const getPublishedBusinesses = cached(getPublishedBusinessesUncached, "getPublishedBusinesses");

export const getPublishedArticles = cached(getPublishedArticlesUncached, "getPublishedArticles");

export const getCategoriesByType = cached(getCategoriesByTypeUncached, "getCategoriesByType");

export const getPublishedArticleBySlug = cached(getPublishedArticleBySlugUncached, "getPublishedArticleBySlug");
