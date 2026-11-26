import { cached } from "@/lib/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DestinationDetail } from "@/types/destination";

const include = {
  category: true,
  facilities: { include: { facility: true } },
  images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
  reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
} satisfies Prisma.DestinationInclude;

type Row = Prisma.DestinationGetPayload<{ include: typeof include }>;

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function toDetail(r: Row): DestinationDetail {
  const count = r.reviews.length;
  const avg = count ? r.reviews.reduce((a, x) => a + x.rating, 0) / count : 0;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category.slug as DestinationDetail["category"],
    categoryLabel: r.category.name,
    district: r.district,
    address: r.address,
    summary: r.summary,
    description: r.description,
    ticketWeekday: r.ticketPriceWeekday ?? 0,
    ticketWeekend: r.ticketPriceWeekend ?? 0,
    openingHours: r.openingHours ?? "-",
    bestVisitingTime: r.bestVisitingTime ?? "-",
    accessibility: r.accessibilityNotes ?? "-",
    contactPhone: r.contactPhone ?? "-",
    contactManager: r.contactManagerName ?? "-",
    latitude: r.latitude ?? 0,
    longitude: r.longitude ?? 0,
    rating: Math.round(avg * 10) / 10,
    reviewCount: count,
    facilities: r.facilities.map((f) => f.facility.name),
    coverGradient: r.coverGradient ?? "from-primary-900 to-primary-950",
    accentColor: r.accentColor ?? "teal",
    images: r.images.map((i) => ({ id: i.id, url: i.url, caption: i.caption ?? "", isCover: i.isCover })),
    coverUrl: (r.images.find((i) => i.isCover) ?? r.images[0])?.url ?? null,
    reviews: r.reviews.map((v) => ({
      id: v.id,
      author: v.authorName,
      date: dateFmt.format(v.createdAt),
      rating: v.rating,
      comment: v.comment,
    })),
  };
}

/** Destinasi terbit untuk situs publik. */
async function getPublishedDestinationsUncached(opts?: { featuredOnly?: boolean; take?: number }) {
  const rows = await prisma.destination.findMany({
    where: { status: "PUBLISHED", ...(opts?.featuredOnly ? { isFeatured: true } : {}) },
    include,
    orderBy: { createdAt: "asc" },
    take: opts?.take,
  });
  return rows.map(toDetail);
}

async function getPublishedDestinationBySlugUncached(slug: string) {
  const row = await prisma.destination.findFirst({ where: { slug, status: "PUBLISHED" }, include });
  return row ? toDetail(row) : null;
}

/** Semua status — hanya untuk CMS admin. */
/** managerId diisi untuk DESTINATION_MANAGER agar hanya destinasi miliknya yang dimuat. */
export async function getAllDestinationsForAdmin(onlyManagerId?: string) {
  const rows = await prisma.destination.findMany({
    where: onlyManagerId ? { managerId: onlyManagerId } : undefined,
    include,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    ...toDetail(r),
    status: r.status,
    managerId: r.managerId ?? "",
    // Nilai mentah untuk form (toDetail memakai 0 untuk "belum ada koordinat").
    coordLat: r.latitude === null ? "" : String(r.latitude),
    coordLng: r.longitude === null ? "" : String(r.longitude),
  }));
}

export async function getManagerOptions() {
  return prisma.user.findMany({
    where: { role: "DESTINATION_MANAGER", isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

async function getDestinationCategoriesUncached() {
  return prisma.category.findMany({
    where: { type: "DESTINATION" },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });
}

export const getPublishedDestinations = cached(getPublishedDestinationsUncached, "getPublishedDestinations");

export const getPublishedDestinationBySlug = cached(getPublishedDestinationBySlugUncached, "getPublishedDestinationBySlug");

export const getDestinationCategories = cached(getDestinationCategoriesUncached, "getDestinationCategories");
